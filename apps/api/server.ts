import express, {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "cookie-session"
import dotenv from "dotenv"
import helmet from "helmet"
import { Server, EVENTS, Upload, ServerOptions } from "@tus/server"
import { S3Store } from "@tus/s3-store"
import {
  S3Client,
  S3ClientConfig,
  GetObjectCommand,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3"

import pathNode from "node:path"
import sharp from "sharp"
import { Readable } from "stream"

dotenv.config()

const normalizeUrlString = (raw?: string | null) => {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const toURL = (raw?: string | null, fallback?: string) => {
  const attempts = [normalizeUrlString(raw), normalizeUrlString(fallback)]
  for (const candidate of attempts) {
    if (!candidate) continue
    try {
      return new URL(candidate)
    } catch (error) {
      console.warn(`[server] Ignoring invalid URL: ${candidate}`)
    }
  }
  return null
}

const toOrigin = (raw?: string | null) => {
  const url = toURL(raw)
  return url?.origin ?? null
}

const addHostVariants = (host: string | undefined | null, target: Set<string>) => {
  if (!host) return
  const prefixes = ["", "www.", "admin.", "prixer."]
  const protocols = ["https://", "http://"]
  prefixes.forEach((prefix) => {
    protocols.forEach((protocol) => {
      const origin = toOrigin(`${protocol}${prefix}${host}`)
      if (origin) {
        target.add(origin)
      }
    })
  })
}

const app = express()

export const isProduction = process.env.NODE_ENV === "production"

const trustProxy = process.env.TRUST_PROXY ?? (isProduction ? "1" : "0")
app.set("trust proxy", trustProxy)

const defaultSessionKeys = [
  process.env.SESSION_KEY_PRIMARY,
  process.env.SESSION_KEY_SECONDARY,
]
  .filter(Boolean)
  .map((key) => key!.trim())

const envSessionKeys = (process.env.SESSION_KEYS ?? "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean)

const sessionKeys = envSessionKeys.length ? envSessionKeys : defaultSessionKeys
if (!sessionKeys.length) {
  sessionKeys.push(
    "dev_session_key_primary",
    "dev_session_key_secondary"
  )
  if (isProduction) {
    console.warn(
      "[server] SESSION_KEYS not configured. Using fallback dev keys, which is insecure for production."
    )
  }
}

const sessionSecure = process.env.SESSION_SECURE
  ? process.env.SESSION_SECURE === "true"
  : isProduction

const allowedSameSite = new Set(["lax", "strict", "none"])
const sessionSameSite = allowedSameSite.has(
  (process.env.SESSION_SAMESITE ?? "").toLowerCase()
)
  ? (process.env.SESSION_SAMESITE!.toLowerCase() as "lax" | "strict" | "none")
  : (isProduction ? "none" : "lax")

const sessionDomain = process.env.SESSION_DOMAIN
  ? process.env.SESSION_DOMAIN.trim() || undefined
  : isProduction
    ? ".prixelart.com"
    : undefined

app.use(
  session({
    name: process.env.SESSION_NAME || "session",
    keys: sessionKeys,
    secure: sessionSecure,
    httpOnly: true,
    sameSite: sessionSameSite,
    domain: sessionDomain,
    path: "/",
    maxAge: 12 * 60 * 60 * 1000,
    overwrite: true,
  })
)

const frontEndUrl = toURL(
  process.env.FRONT_END_URL,
  "http://localhost:5173"
)
const adminFrontEndUrl = toURL(
  process.env.ADMIN_FRONT_END_URL,
  "http://localhost:4173"
)

const allowedOriginsSet = new Set<string>()
if (frontEndUrl) {
  allowedOriginsSet.add(frontEndUrl.origin)
  addHostVariants(frontEndUrl.hostname, allowedOriginsSet)
}
if (adminFrontEndUrl) {
  allowedOriginsSet.add(adminFrontEndUrl.origin)
  addHostVariants(adminFrontEndUrl.hostname, allowedOriginsSet)
}
;
[
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4173",
  "http://localhost:5173",
].forEach((origin) => {
  const normalized = toOrigin(origin)
  if (normalized) {
    allowedOriginsSet.add(normalized)
  }
})

const extraOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

extraOrigins.forEach((origin) => {
  const normalized = toOrigin(origin)
  if (normalized) {
    allowedOriginsSet.add(normalized)
  }
})

const allowedOrigins = Array.from(allowedOriginsSet)

app.disable("x-powered-by")

const TUS_EXPOSED_HEADERS_LIST = [
  "Location",
  "Upload-Offset",
  "Upload-Length",
  "Tus-Version",
  "Tus-Resumable",
  "Tus-Extension",
  "Tus-Max-Size",
  "Upload-Metadata",
  "Upload-Defer-Length",
  "Upload-Concat",
  "x-final-url",
]
const TUS_EXPOSED_HEADERS_STRING = TUS_EXPOSED_HEADERS_LIST.join(", ")

const tusCors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn(
        `CORS Bloqueado para TUS: Origen '${origin}' no en allowedOrigins.`
      )
      callback(new Error(`Origen '${origin}' no permitido por TUS CORS`))
    }
  },
  credentials: true,
  exposedHeaders: TUS_EXPOSED_HEADERS_STRING,
  methods: ["OPTIONS", "POST", "HEAD", "PATCH", "DELETE"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Cookie",
    "Origin",
    "Tus-Resumable",
    "Upload-Concat",
    "Upload-Length",
    "Upload-Metadata",
    "Upload-Offset",
    "X-HTTP-Method-Override",
    "X-Requested-With",
  ],
})

const tusFilesPath: string = "/files"

const doSpacesEndpoint: string | undefined = process.env.PRIVATE_BUCKET_URL
const doSpacesRegion: string = process.env.DO_SPACES_REGION || "nyc3"
const publicBucketName: string | undefined = process.env.PUBLIC_BUCKET_NAME
const privateBucketName: string | undefined = process.env.PRIVATE_BUCKET_NAME
const doSpacesAccessKey: string | undefined = process.env.DO_ACCESS_KEY
const doSpacesSecretKey: string | undefined = process.env.DO_ACCESS_SECRET

if (
  !doSpacesEndpoint ||
  !doSpacesRegion ||
  !publicBucketName ||
  !privateBucketName ||
  !doSpacesAccessKey ||
  !doSpacesSecretKey
) {
  console.error(
    "FATAL ERROR: Credenciales y configuración de DigitalOcean Spaces faltantes."
  )
  process.exit(1)
}


interface MyS3StoreOptions {
  s3ClientConfig: S3ClientConfig & { bucket: string };
  uploadParams?: (
    req: any,
    upload: any
  ) => {
    ACL?: ObjectCannedACL;
    ContentType?: string;
    [key: string]: any;
  };
}

const s3ClientConfigForStore: S3ClientConfig & { bucket: string } = {
  bucket: privateBucketName,
  region: doSpacesRegion,
  endpoint: `https://${doSpacesEndpoint}`,
  credentials: {
    accessKeyId: doSpacesAccessKey,
    secretAccessKey: doSpacesSecretKey,
  },
  forcePathStyle: true,
}

const s3StoreOptions: MyS3StoreOptions = {
  s3ClientConfig: s3ClientConfigForStore,
  uploadParams: (req: any, upload: any) => {
    const metadata = upload.metadata || {}
    const filetype = (metadata.filetype as string) || "application/octet-stream"

    // console.log(
    //   `[s3StoreOptions.uploadParams] Para ID: ${upload.id}, Contexto: ${metadata.context}. ` +
    //     `Subida inicial a bucket PRIVADO ('${privateBucketName}') con ACL 'private', ContentType: '${filetype}'`
    // )
    return {
      ACL: "private" as ObjectCannedACL,
      ContentType: filetype,
    }
  },
}

const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })

const genericS3Client = new S3Client({
  region: doSpacesRegion,
  endpoint: `https://${doSpacesEndpoint}`,
  credentials: {
    accessKeyId: doSpacesAccessKey,
    secretAccessKey: doSpacesSecretKey,
  },
  forcePathStyle: true,
})

const tusServer = new Server({
  path: tusFilesPath,
  datastore: new S3Store(s3StoreOptions),
  respectForwardedHeaders: true,

  async onUploadCreate(req: any, upload: Upload) {
    const originalFilename =
      upload.metadata?.filename || upload.metadata?.name || `file-${Date.now()}`
    let extension = ""
    if (originalFilename && typeof originalFilename === "string") {
      extension = pathNode.extname(originalFilename)
    }
    upload.id = `${upload.id}${extension}`

    // console.log(
    //   `[TUS SERVER - onUploadCreate] S3 Key en bucket privado será: ${
    //     upload.id
    //   }, Size: ${upload.size}, Meta: ${JSON.stringify(upload.metadata)}`
    // )
    return upload
  },

  onUploadFinish: async (req: any, upload: Upload): Promise<any> => {
    const metadata = upload.metadata || {};
    const objectKeyInPrivateBucket = upload.id;
    if (!objectKeyInPrivateBucket) {
        console.error(
            `[onUploadFinish] Error: No objectKey for upload ID: ${upload.id}`
        );
        return { status_code: 500, body: "Internal Error: No object key." };
    }
    const cleanKeyInPrivateBucket = objectKeyInPrivateBucket.startsWith("/")
        ? objectKeyInPrivateBucket.substring(1)
        : objectKeyInPrivateBucket;

    const isArtUpload = metadata.context === "artPieceImage";
    let finalUrlToClient: string;

    // --- Caching Configuration ---
    // Cache for 1 year (365 days * 24 hours * 60 minutes * 60 seconds)
    const oneYearInSeconds = 31536000;
    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + 1);

    const cacheControlHeader = `public, max-age=${oneYearInSeconds}, immutable`;
    // --- End Caching Configuration ---

    try {
        // Handle Art Uploads (with image processing)
        if (isArtUpload) {
            const getObjectParams = {
                Bucket: privateBucketName,
                Key: cleanKeyInPrivateBucket,
            };
            const getObjectResult = await genericS3Client.send(
                new GetObjectCommand(getObjectParams)
            );
            if (
                !getObjectResult.Body ||
                !(getObjectResult.Body instanceof Readable)
            ) {
                throw new Error(
                    "The body of the original object is not a readable stream."
                );
            }

            const originalImageBuffer = await streamToBuffer(getObjectResult.Body);
            const processedImageBuffer = await sharp(originalImageBuffer)
                .webp({ quality: 50 })
                .toBuffer();
            const originalFileNameNoExt = pathNode.basename(
                cleanKeyInPrivateBucket,
                pathNode.extname(cleanKeyInPrivateBucket)
            );
            const publicArtObjectKey = `arte_procesado/${originalFileNameNoExt}_q50_${Date.now()}.webp`;

            const putPublicArtParams = {
                Bucket: publicBucketName,
                Key: publicArtObjectKey,
                Body: processedImageBuffer,
                ACL: "public-read" as ObjectCannedACL,
                ContentType: "image/webp",
                // Add Caching Headers
                CacheControl: cacheControlHeader,
                Expires: expiresDate,
            };

            await genericS3Client.send(new PutObjectCommand(putPublicArtParams));
            finalUrlToClient = `https://${publicBucketName}.${doSpacesEndpoint!.replace(
                "https://",
                ""
            )}/${publicArtObjectKey}`;
        
        // Handle all other file uploads
        } else {
            const getObjectParams = {
                Bucket: privateBucketName!,
                Key: cleanKeyInPrivateBucket,
            };
            const getObjectResult = await genericS3Client.send(
                new GetObjectCommand(getObjectParams)
            );
            if (
                !getObjectResult.Body ||
                !(getObjectResult.Body instanceof Readable)
            ) {
                throw new Error(
                    "The body of the original non-art object is not a readable stream."
                );
            }
            const originalNonArtBuffer = await streamToBuffer(
                getObjectResult.Body as Readable
            );
            const publicNonArtObjectKey = `otros_archivos_publicos/${cleanKeyInPrivateBucket}`;

            const putPublicNonArtParams = {
                Bucket: publicBucketName!,
                Key: publicNonArtObjectKey,
                Body: originalNonArtBuffer,
                ACL: "public-read" as ObjectCannedACL,
                ContentType:
                    (metadata.filetype as string) || "application/octet-stream",
                // Add Caching Headers
                CacheControl: cacheControlHeader,
                Expires: expiresDate,
            };

            await genericS3Client.send(new PutObjectCommand(putPublicNonArtParams));
            finalUrlToClient = `https://${publicBucketName!}.${doSpacesEndpoint!.replace(
                "https://",
                ""
            )}/${publicNonArtObjectKey}`;
        }
    } catch (error: any) {
        console.error(`[onUploadFinish] General error in hook: `, error);
        return {
            status_code: 500,
            body: `Server error during upload finalization: ${error.message}`,
        };
    }

    // Return the final public URL to the client
    return {
        headers: {
            "x-final-url": finalUrlToClient,
            "Access-Control-Expose-Headers": TUS_EXPOSED_HEADERS_STRING,
        },
    };
},

  onResponseError: async (
    req: any,
    error: Error | { status_code: number; body: string }
  ) => {
    console.error("[onResponseError] Error del Servidor TUS:", error)
    if (error instanceof Error) {
      return {
        status_code: 500,
        body: `Ocurrió un error inesperado: ${error.message}`,
      }
    }
    return error as { status_code: number; body: string }
  },
})

tusServer.on(
  EVENTS.POST_CREATE,
  (req: ExpressRequest, res: Response, upload: Upload) => {
    console.log(
      `[TUS SERVER (S3Store) - ${EVENTS.POST_CREATE}] Evento recibido.`
    )
    // console.log(`  ---> ID en POST_CREATE: ${upload.id}`)
  }
)

tusServer.on(
  EVENTS.POST_FINISH,
  (req: ExpressRequest, res: Response, upload: Upload) => {
    // console.log(
    //   `[TUS SERVER (S3Store) - ${EVENTS.POST_FINISH}] Listener: Subida finalizada para ID: ${upload.id}.`
    // )
  }
)

app.use(helmet())
const tusMiddleware = tusServer.handle.bind(tusServer)
app.use(tusFilesPath, tusCors, tusMiddleware)

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      } else {
        const msg =
          "La política CORS para este sitio no permite el acceso desde el Origen especificado."
        return callback(new Error(msg), false)
      }
    },
    exposedHeaders: ["Location"],
  })
)
app.use(cookieParser())
app.use(express.urlencoded({ limit: "1mb", extended: false }))
app.use(express.json({ limit: "1mb" }))

app.get("/ping", (req, res) => {
  res.status(200).send("pong desde Express!")
})

import userRoutes from "./src/user/userRoutes.ts"
import prixerRoutes from "./src/prixer/prixerRoutes.ts"
import adminRoutes from "./src/admin/adminRoutes.ts"
import preferencesRoutes from "./src/preferences/preferencesRoutes.ts"
import artRoutes from "./src/art/artRoutes.ts"
import productRoutes from "./src/product/productRoutes.ts"
import orderRoutes from "./src/order/orderRoutes.ts"
import orderArchiveRoutes from "./src/orderArchive/orderArchiveRoutes.ts"
import testimonialRoutes from "./src/testimonials/testimonialRoutes.ts"
import discountRoutes from "./src/discount/discountRoutes.ts"
import accountRoutes from "./src/account/accountRoutes.ts"
import movementsRoutes from "./src/movements/movementRoutes.ts"
import servicesRoutes from "./src/serviceOfPrixers/serviceRoutes.ts"
import organizationsRoutes from "./src/organizations/organizationRoutes.ts"
import surchargeRoutes from "./src/surcharge/surchargeRoutes.ts"

app.use("/", userRoutes)
app.use("/", prixerRoutes)
app.use("/", adminRoutes)
app.use("/", artRoutes)
app.use("/", productRoutes)
app.use("/", orderRoutes)
app.use("/", orderArchiveRoutes)
app.use("/", preferencesRoutes)
app.use("/", testimonialRoutes)
app.use("/", discountRoutes)
app.use("/", accountRoutes)
app.use("/", movementsRoutes)
app.use("/", servicesRoutes)
app.use("/", organizationsRoutes)
app.use("/", surchargeRoutes)

app.use(
  (err: any, _req: ExpressRequest, res: Response, _next: NextFunction) => {
    console.error("Error no manejado:", err)
    res.status(err.status || 500)
    res.json({ error: err.message || "Error desconocido" })
  }
)

export default app
