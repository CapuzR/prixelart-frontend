import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  ImageList,
  ImageListItem,
  Alert,
  CircularProgress,
  ImageListItemBar,
  useMediaQuery,
  useTheme,
  Skeleton,
  Modal,
  Button,
  Divider,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  ListItemText,
  Input,
  DialogActions,
  DialogTitle,
  Dialog,
  DialogContent,
  LinearProgress,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import {
  Instagram,
  Twitter,
  Facebook,
  InfoOutlined,
  ExpandMore as ExpandMoreIcon,
  AccountCircle,
  SentimentVeryDissatisfied,
  CloudOff,
  CollectionsBookmark,
  Share as ShareIcon,
  Close as CloseIcon,
  SortByAlpha as SortByAlphaIcon,
  NewReleases as NewReleasesIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  DesignServices as DesignServicesIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { Prixer } from "types/prixer.types";
import { useParams, useNavigate } from "react-router-dom";
import { getPrixerByUsername, updatePrixerProfile } from "@api/prixer.api";
import { User } from "types/user.types";
import { getArtsByPrixer, PaginatedArtsResult } from "@api/art.api";
import { Art } from "types/art.types";
import { Service } from "types/service.types";
import { fetchServicesByUser } from "@api/service.api";
import { useLoading, useSnackBar, useUser } from "@context/GlobalContext";
import ReactCrop, {
  centerCrop,
  Crop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import { BACKEND_URL } from "@api/utils.api";
import * as tus from "tus-js-client";
import ScrollToTopButton from "@components/ScrollToTop";

const ARTS_PER_PAGE = 12;
const availableSpecialties = [
  "Fotografía",
  "Ilustración",
  "Diseño",
  "Artes Plásticas",
  "Música",
  "Escritura",
];

const lightboxModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0.5,
  outline: "none",
  maxWidth: "90vw",
  maxHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 1,
};

const sortOptions = [
  {
    value: "createdAt_desc",
    label: "Nuevos Primero",
    icon: <NewReleasesIcon fontSize="small" sx={{ mr: 1.5 }} />,
  },
  {
    value: "createdAt_asc",
    label: "Antiguos Primero",
    icon: (
      <NewReleasesIcon
        fontSize="small"
        sx={{ mr: 1.5, transform: "scaleY(-1)" }}
      />
    ),
  },
  {
    value: "title_asc",
    label: "Título (A-Z)",
    icon: <SortByAlphaIcon fontSize="small" sx={{ mr: 1.5 }} />,
  },
  {
    value: "title_desc",
    label: "Título (Z-A)",
    icon: (
      <SortByAlphaIcon
        fontSize="small"
        sx={{ mr: 1.5, transform: "scaleY(-1)" }}
      />
    ),
  },
];

const PrixerProfileSkeleton: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const artCols = isSmall ? 2 : isMedium ? 3 : 4;
  return (
    <Card
      sx={{
        maxWidth: 800,
        margin: "auto",
        mt: 4,
        mb: 4,
        boxShadow: 5,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 2, sm: 3 },
            backgroundColor: "grey.200",
            borderTopLeftRadius: (theme) => theme.shape.borderRadius * 2,
            borderTopRightRadius: (theme) => theme.shape.borderRadius * 2,
          }}
        >
          <Skeleton
            variant="circular"
            sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 } }}
          />
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            <Skeleton variant="text" sx={{ fontSize: "h4", width: "60%" }} />
            <Skeleton
              variant="text"
              sx={{ fontSize: "body1", width: "80%", mt: 0.5 }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Stack>
            <Skeleton
              variant="rectangular"
              height={40}
              sx={{ mt: 1.5, width: "90%" }}
            />
          </Box>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end" my={2.5}>
            <Skeleton variant="circular" width={36} height={36} />
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Grid2 container spacing={3} mb={3}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Skeleton
                variant="text"
                width="100px"
                sx={{ mb: 0.5, fontSize: "subtitle1" }}
              />
              <Skeleton
                variant="text"
                width="150px"
                sx={{ fontSize: "body1", ml: 3.5 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Skeleton
                variant="text"
                width="80px"
                sx={{ mb: 1, fontSize: "subtitle1" }}
              />
              <Stack direction="row" spacing={1.5} sx={{ ml: 3.5 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Stack>
            </Grid2>
          </Grid2>
          <Typography variant="h5" gutterBottom>
            <Skeleton width="180px" />
          </Typography>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ mb: 1.5, borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ mb: 1.5, borderRadius: 1 }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
            mb={2}
          >
            <Typography variant="h5">
              <Skeleton width="120px" />
            </Typography>
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={100} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
            </Stack>
          </Stack>
          <ImageList variant="quilted" cols={artCols} gap={12}>
            {Array.from(new Array(artCols)).map((_, index) => (
              <ImageListItem
                key={index}
                sx={{
                  borderRadius: 1.5,
                  aspectRatio: "1 / 1",
                  backgroundColor: "grey.300",
                }}
              >
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </CardContent>
    </Card>
  );
};

async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  ctx.restore();
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export default function PrixerProfileCard() {
  const [prixer, setPrixer] = useState<Prixer | null>(null);
  const [prixerUser, setPrixerUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [arts, setArts] = useState<Art[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [artsLoading, setArtsLoading] = useState<boolean>(false);
  const [moreArtsLoading, setMoreArtsLoading] = useState<boolean>(false);
  const [artsError, setArtsError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const [currentTab, setCurrentTab] = useState("portfolio");
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string>("");

  const [sortOption, setSortOption] = useState<string>(sortOptions[0].value);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const { username: routeUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showSnackBar } = useSnackBar();
  const { loading: isSaving, setLoading: setIsSaving } = useLoading();
  const isOwner = user?.username === routeUsername;

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Prixer>>({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // --- NEW: Uploader and Cropper State ---
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    percentage: number;
    status: string;
  } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [errors, setErrors] = useState<
    Partial<Record<keyof Prixer, string | null>>
  >({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value);
  };

  const handleFilterCategoryChange = (event: SelectChangeEvent<string>) => {
    setFilterCategory(event.target.value);
  };

  const getImageListCols = () => (isSmallScreen ? 2 : isMediumScreen ? 3 : 4);

  useEffect(() => {
    // When prixer data is loaded, initialize the form data
    if (prixer) {
      setFormData({
        avatar: prixer.avatar || "",
        specialty: Array.isArray(prixer.specialty) ? prixer.specialty : [],
        description: prixer.description || "",
        instagram: prixer.instagram || "",
        twitter: prixer.twitter || "",
        facebook: prixer.facebook || "",
        phone: prixer.phone || "",
      });
    }
  }, [prixerUser]);

  const handleFormChange = (field: keyof Prixer, value: string | string[]) => {
    if (typeof value === "string") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between selections
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1 / 1)); // 1:1 aspect ratio for avatar
  };

  const handleConfirmCropAndUpload = async () => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    if (!image || !canvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    await canvasPreview(image, canvas, completedCrop);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error("Failed to create blob");
        }
        const croppedFile = new File([blob], "avatar.webp", {
          type: "image/webp",
        });
        handleTusUpload(croppedFile);
      },
      "image/webp",
      0.85,
    );
    setCropModalOpen(false);
  };

  const handleTusUpload = (file: File) => {
    setUploadProgress({ percentage: 0, status: "Starting..." });

    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 3000, 5000, 10000],
      metadata: { filename: file.name, filetype: file.type },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        setUploadProgress({ percentage, status: "Uploading..." });
      },
      onSuccess: () => {
        const tusUploadInstance = upload as any;
        let finalUrl: string | null = null;

        // This logic is adapted from your ManageCarousels component.
        // It correctly tries to find the final URL from the response headers.
        const xhr =
          tusUploadInstance.xhr ||
          (tusUploadInstance._req && tusUploadInstance._req._xhr);

        if (xhr && typeof xhr.getResponseHeader === "function") {
          finalUrl =
            xhr.getResponseHeader("X-Final-URL") ||
            xhr.getResponseHeader("x-final-url");
        }

        // If the header is missing, fall back to the TUS endpoint URL.
        if (!finalUrl && upload.url) {
          console.warn(
            "X-Final-URL header not found. Falling back to constructing the URL manually. This might not be the public URL.",
          );
          const fileId = upload.url.split("/").pop();
          finalUrl = `${import.meta.env.VITE_PUBLIC_BUCKET_URL}/${fileId}`;
        }

        if (finalUrl) {
          // Update the form state with the new URL
          handleFormChange("avatar", finalUrl);

          setUploadProgress({ percentage: 100, status: "Completed!" });
          showSnackBar("Avatar uploaded. Click Save to apply.");
          setTimeout(() => setUploadProgress(null), 3000);
        } else {
          console.error(
            "CRITICAL: Could not determine final URL after upload.",
          );
          setUploadProgress({ percentage: 100, status: `Error: Missing URL` });
          showSnackBar("Upload failed: Could not retrieve file URL.");
        }
      },
      onError: (error) => {
        console.error("Failed to upload", error);
        setUploadProgress({ percentage: 0, status: `Error` });
        showSnackBar(`Upload failed: ${error.message}`);
      },
    });

    upload.start();
  };

  const fieldRefs = {
    avatar: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    instagram: useRef<HTMLInputElement>(null),
    twitter: useRef<HTMLInputElement>(null),
    facebook: useRef<HTMLInputElement>(null),
  };

  const handleSave = async () => {
    if (!prixerUser?._id) {
      showSnackBar("Error: User ID not found.");
      return;
    }

    const newErrors: typeof errors = {};
    let firstErrorField: keyof typeof fieldRefs | null = null;

    const fieldsToValidate: Array<keyof typeof fieldRefs> = [
      "phone",
      "instagram",
      "twitter",
      "facebook",
    ];

    for (const key of fieldsToValidate) {
      const value = formData[key] as string;
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        if (!firstErrorField) {
          firstErrorField = key;
        }
      }
    }

    setErrors(newErrors);

    if (firstErrorField) {
      const errorFieldNames = Object.keys(newErrors).join(", ");
      showSnackBar(`Please fix the following fields: ${errorFieldNames}`);

      fieldRefs[firstErrorField]?.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const dataToUpdate: Partial<Prixer> = {
        ...formData,
        specialty: formData.specialty || [],
      };

      const response = await updatePrixerProfile(
        prixerUser._id.toString(),
        dataToUpdate,
      );
      if (response.success && response.result) {
        const updatedUser = response.result as User;
        setPrixer(updatedUser.prixer || null);
        setPrixerUser(updatedUser);
        showSnackBar("Profile updated successfully!");
        setIsEditMode(false);
      } else {
        showSnackBar(response.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      showSnackBar("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (prixer) setFormData(prixer);
  };

  const loadPrixerArts = useCallback(
    async (
      prixerUsernameToLoad: string,
      pageNum: number,
      currentSort: string,
      currentCategory: string,
      isInitialArtLoadForUser: boolean = false,
    ) => {
      if (pageNum === 1) {
        setArtsLoading(true);
        setArtsError(null);
      } else {
        setMoreArtsLoading(true);
      }

      try {
        const data: PaginatedArtsResult | null = await getArtsByPrixer(
          prixerUsernameToLoad,
          pageNum,
          ARTS_PER_PAGE,
          currentSort,
          currentCategory,
        );

        if (data) {
          setArts((prev) =>
            pageNum === 1 ? data.arts : [...prev, ...data.arts],
          );
          setCurrentPage(data.currentPage);
          setHasNextPage(data.hasNextPage);

          if (isInitialArtLoadForUser && pageNum === 1) {
            const uniqueCategories = Array.from(
              new Set(
                data.arts
                  .map((art) => art.category)
                  .filter(Boolean) as string[],
              ),
            );
            setAvailableCategories(uniqueCategories.sort());
          }
        } else {
          setHasNextPage(false);
          if (isInitialArtLoadForUser && pageNum === 1)
            setAvailableCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch arts in component:", err);
        setArtsError(
          err instanceof Error ? err.message : "Could not retrieve arts.",
        );
        if (isInitialArtLoadForUser && pageNum === 1)
          setAvailableCategories([]);
      } finally {
        if (pageNum === 1) setArtsLoading(false);
        else setMoreArtsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!routeUsername) {
      setError("No Username provided in URL.");
      setLoading(false);
      setHasNextPage(false);
      return;
    }

    const loadProfileAndData = async () => {
      setLoading(true);
      setError(null);
      setPrixer(null);
      setPrixerUser(null);
      setUserName(undefined);
      setArts([]);
      setServices([]);
      setCurrentPage(1);
      setHasNextPage(true);
      setArtsError(null);
      setServicesError(null);
      setShowFullDescription(false);

      try {
        const userDataResponse: User | null =
          await getPrixerByUsername(routeUsername);

        if (userDataResponse?.prixer) {
          setPrixerUser(userDataResponse);
          setPrixer(userDataResponse.prixer);
          setUserName(userDataResponse.username);
          const prixerId = userDataResponse?.prixer._id?.toString();

          setServicesLoading(true);
          await Promise.all([
            loadPrixerArts(
              userDataResponse.username,
              1,
              sortOption,
              filterCategory,
              true,
            ),
            (async () => {
              try {
                if (!prixerId) throw new Error("Prixer ID is missing.");
                const servicesData = await fetchServicesByUser(prixerId);
                setServices(
                  servicesData.filter(
                    (s: Service) =>
                      s.active &&
                      (s.visible === true || s.visible === undefined),
                  ) || [],
                );
              } catch (err) {
                console.error("Failed to fetch services:", err);
                setServicesError(
                  "Could not retrieve services for this Prixer.",
                );
              } finally {
                setServicesLoading(false);
              }
            })(),
          ]);
        } else if (userDataResponse) {
          setError(`User '${userDataResponse.username}' is not a Prixer.`);
          setHasNextPage(false);
        } else {
          setError(`Prixer profile for '${routeUsername}' not found.`);
          setHasNextPage(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };
    loadProfileAndData();
  }, [routeUsername, sortOption, filterCategory, loadPrixerArts]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!hasNextPage || artsLoading || moreArtsLoading || !userName) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && userName) {
          loadPrixerArts(userName, currentPage + 1, sortOption, filterCategory);
        }
      },
      { threshold: 0.1 },
    );

    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) observerRef.current.observe(currentTrigger);

    return () => {
      if (observerRef.current && currentTrigger)
        observerRef.current.unobserve(currentTrigger);
      else if (observerRef.current) observerRef.current.disconnect();
    };
  }, [
    hasNextPage,
    artsLoading,
    moreArtsLoading,
    currentPage,
    userName,
    sortOption,
    filterCategory,
    loadPrixerArts,
  ]);

  const getSocialLink = (platform: string, handle?: string) => {
    if (!handle) return null;
    const cleanedHandle = handle.replace("@", "");
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${cleanedHandle}`;
      case "twitter":
        return `https://twitter.com/${cleanedHandle}`;
      case "facebook":
        return `https://facebook.com/${cleanedHandle}`;
      default:
        return null;
    }
  };

  const validateField = (name: keyof Prixer, value: string): string | null => {
    if (!value) return null; // Don't validate empty fields, only on submit

    switch (name) {
      case "phone":
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
        if (!phoneRegex.test(value)) {
          return "Invalid phone number format.";
        }
        return null;

      case "instagram":
      case "twitter":
        const handleRegex = /^@?[a-zA-Z0-9._]{1,30}$/;
        if (!handleRegex.test(value)) {
          return "Invalid handle format. Spaces are not allowed.";
        }
        return null;

      case "facebook":
        if (/\s/.test(value)) {
          return "Facebook path cannot contain spaces.";
        }
        return null;

      case "avatar":
        try {
          new URL(value);
          return null;
        } catch (_) {
          return "Please enter a valid URL.";
        }

      default:
        return null;
    }
  };

  const handleOpenLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };
  const handleCloseLightbox = () => setLightboxOpen(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `Check out ${userName}'s profile on Prixer`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Discover ${userName}'s artwork and bio!`,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          copyToClipboard(shareUrl, shareTitle);
        }
      }
    } else {
      copyToClipboard(shareUrl, shareTitle);
    }
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${title}\nLink copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        alert("Failed to copy link. Please copy it manually.");
      });
  };

  if (loading) return <PrixerProfileSkeleton />;
  if (error && !prixer) {
    return (
      <Alert
        severity="error"
        icon={<CloudOff fontSize="inherit" />}
        sx={{ m: { xs: 1, sm: 2 }, p: 2 }}
      >
        <Typography fontWeight="bold">{error}</Typography>
        <Typography variant="body2">Por favor, intente nuevamente.</Typography>
      </Alert>
    );
  }
  if (!prixer || !prixerUser) {
    return (
      <Alert
        severity="info"
        icon={<SentimentVeryDissatisfied fontSize="inherit" />}
        sx={{ m: { xs: 1, sm: 2 }, p: 2 }}
      >
        <Typography fontWeight="bold">Perfil No Disponible</Typography>
        <Typography variant="body2">
          El perfil de Prixer no pudo ser cargado.
        </Typography>
      </Alert>
    );
  }

  const {
    avatar,
    specialty,
    description,
    instagram,
    twitter,
    facebook,
    phone,
    bio,
  } = prixer;
  const prixerLocation =
    prixerUser.city && prixerUser.country
      ? `${prixerUser.city}, ${prixerUser.country}`
      : prixerUser.city || prixerUser.country || null;

  return (
    <>
      <Card
        sx={{
          maxWidth: 800,
          margin: "auto",
          mt: { xs: 2, sm: 4 },
          mb: { xs: 2, sm: 4 },
          boxShadow: 5,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* ============================================= */}
          {/* HEADER                                        */}
          {/* ============================================= */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 2, sm: 3 },
              background: (th) =>
                `linear-gradient(135deg, ${th.palette.primary.light} 0%, ${th.palette.secondary.light} 100%)`,
              color: "common.white",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {/* --- AVATAR & UPLOADER --- */}
            <Box>
              {isEditMode ? (
                <Stack spacing={1} alignItems="center">
                  <Avatar
                    src={formData.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid rgba(255,255,255,0.8)",
                    }}
                  />
                  <Button
                    component="label"
                    size="small"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Cargar
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={onSelectFile}
                    />
                  </Button>
                  {uploadProgress && (
                    <Box sx={{ width: "100%", mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress.percentage}
                        color={
                          uploadProgress.status.startsWith("Error")
                            ? "error"
                            : "primary"
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "white",
                          textAlign: "center",
                          display: "block",
                        }}
                      >
                        {uploadProgress.status}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Avatar
                  src={avatar}
                  alt={userName || "Prixer"}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    border: "4px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  {!avatar && (
                    <AccountCircle sx={{ fontSize: { xs: 60, sm: 80 } }} />
                  )}
                </Avatar>
              )}
            </Box>

            {/* --- MAIN INFO & EDIT CONTROLS --- */}
            <Box sx={{ flexGrow: 1, width: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                gap={1}
              >
                <Typography
                  variant="h4"
                  component="div"
                  fontWeight="bold"
                  sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
                >
                  {userName || "Prixer Profile"}
                </Typography>
                {isOwner && (
                  <Box sx={{ flexShrink: 0, mt: { xs: 1, sm: 0 } }}>
                    {isEditMode ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          onClick={handleSave}
                          disabled={isSaving}
                          sx={{
                            bgcolor: "success.main",
                            "&:hover": { bgcolor: "success.dark" },
                          }}
                        >
                          {isSaving ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={handleCancel}
                        >
                          Cancelar
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditMode(true)}
                        sx={{
                          color: "white",
                          borderColor: "rgba(255, 255, 255, 0.7)",
                          "&:hover": {
                            borderColor: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                        }}
                      >
                        Editar Perfil
                      </Button>
                    )}
                  </Box>
                )}
              </Stack>

              {/* --- SPECIALTY --- */}
              <Box mt={1}>
                {isEditMode ? (
                  <FormControl fullWidth variant="standard" sx={{ mt: 1 }}>
                    <InputLabel
                      id="specialty-mutiple-chip-label"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        "&.Mui-focused": { color: "white" },
                      }}
                    >
                      Especialidades
                    </InputLabel>
                    <Select
                      labelId="specialty-mutiple-chip-label"
                      multiple
                      value={formData.specialty || []}
                      onChange={(e) =>
                        handleFormChange(
                          "specialty",
                          e.target.value as string[],
                        )
                      }
                      input={
                        <Input
                          sx={{
                            color: "white",
                            "&:before": {
                              borderBottomColor: "rgba(255,255,255,0.8)",
                            },
                            "&:hover:not(.Mui-disabled):before": {
                              borderBottomColor: "white",
                            },
                            ".MuiSvgIcon-root": {
                              color: "rgba(255,255,255,0.8)",
                            },
                          }}
                        />
                      }
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {(selected as string[]).map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              sx={{
                                color: "white",
                                bgcolor: "rgba(255, 255, 255, 0.25)",
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {availableSpecialties.map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox
                            checked={
                              (formData.specialty || []).indexOf(name) > -1
                            }
                          />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  specialty &&
                  specialty.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{
                        mt: 1,
                        justifyContent: { xs: "center", sm: "flex-start" },
                      }}
                    >
                      {specialty.map((spec, index) => (
                        <Chip
                          key={index}
                          label={spec}
                          size="small"
                          sx={{
                            fontWeight: "medium",
                            color: "white",
                            backgroundColor: "rgba(0,0,0,0.25)",
                            "&:hover": { backgroundColor: "rgba(0,0,0,0.4)" },
                          }}
                        />
                      ))}
                    </Stack>
                  )
                )}
              </Box>

              {/* --- DESCRIPTION --- */}
              <Box mt={1.5}>
                {isEditMode ? (
                  <TextField
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    variant="standard"
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    sx={{
                      ".MuiInputBase-input": {
                        color: "white",
                        whiteSpace: "pre-wrap",
                      },
                      ".MuiInputLabel-root": { color: "rgba(255,255,255,0.8)" },
                      ".MuiInput-underline:before": {
                        borderBottomColor: "rgba(255,255,255,0.8)",
                      },
                      ".MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottomColor: "white",
                      },
                    }}
                  />
                ) : (
                  description && (
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        opacity: 0.9,
                        fontSize: "0.95rem",
                        fontWeight: "400",
                      }}
                    >
                      {description}
                    </Typography>
                  )
                )}
              </Box>
            </Box>
          </Box>

          {/* ============================================= */}
          {/* TABS & PANELS                                 */}
          {/* ============================================= */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="Prixer Profile Tabs"
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                icon={<CollectionsBookmark />}
                iconPosition="start"
                label="Artes"
                value="portfolio"
              />
              <Tab
                icon={<DesignServicesIcon />}
                iconPosition="start"
                label="Servicios"
                value="services"
              />
              <Tab
                icon={<PersonIcon />}
                iconPosition="start"
                label="Biografía"
                value="about"
              />
            </Tabs>
          </Box>

          {/* --- PORTFOLIO TAB --- */}
          {currentTab === "portfolio" && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid2 container spacing={isSmallScreen ? 1 : 2} sx={{ mb: 2.5 }}>
                <Grid2
                  size={{
                    xs: 12,
                    sm: availableCategories.length > 0 ? 6 : 12,
                    md: availableCategories.length > 0 ? 5 : 8,
                  }}
                >
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel id="sort-by-label">Ordenar Por</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={sortOption}
                      label="Ordenar Por"
                      onChange={handleSortChange}
                    >
                      {sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {option.icon}
                            {option.label}
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                {availableCategories.length > 0 && (
                  <Grid2
                    size={{
                      xs: 12,
                      sm: 6,
                      md: availableCategories.length > 0 ? 5 : 4,
                    }}
                  >
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel id="filter-category-label">
                        Categoría
                      </InputLabel>
                      <Select
                        labelId="filter-category-label"
                        value={filterCategory}
                        label="Categoría"
                        onChange={handleFilterCategoryChange}
                      >
                        <MenuItem value="">
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <CategoryIcon fontSize="small" />
                            Todas Las Categorías
                          </Stack>
                        </MenuItem>
                        {availableCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>
                )}
                {(filterCategory || sortOption !== sortOptions[0].value) &&
                  availableCategories.length > 0 && (
                    <Grid2
                      size={{ xs: 12, md: 2 }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                      }}
                    >
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setFilterCategory("");
                          setSortOption(sortOptions[0].value);
                        }}
                        sx={{ mt: { xs: 1, md: 0 } }}
                      >
                        Limpiar Filtros
                      </Button>
                    </Grid2>
                  )}
              </Grid2>
              {artsLoading && (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  my={3}
                  sx={{ minHeight: "200px" }}
                >
                  <CircularProgress />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Cargando artes...
                  </Typography>
                </Box>
              )}
              {artsError && !artsLoading && (
                <Alert
                  severity="warning"
                  sx={{ my: 2 }}
                >{`Could not load artworks: ${artsError}`}</Alert>
              )}
              {!artsLoading && !artsError && arts.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    backgroundColor: "grey.100",
                  }}
                >
                  <InfoOutlined
                    sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No se encontraron artes
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Este Prixer no dispone de artes en este momento
                  </Typography>
                </Paper>
              )}
              {arts.length > 0 && (
                <ImageList variant="quilted" cols={getImageListCols()} gap={12}>
                  {arts.map((art) => (
                    <ImageListItem
                      key={art._id?.toString() || art.artId}
                      onClick={() => navigate(`/arte/${art.artId}`)}
                      sx={{
                        borderRadius: 1.5,
                        overflow: "hidden",
                        cursor: "pointer",
                        "&:hover .MuiImageListItemBar-root": { opacity: 1 },
                        "&:hover img": { transform: "scale(1.03)" },
                      }}
                    >
                      <img
                        src={`${art.mediumThumbUrl || art.imageUrl}`}
                        alt={art.title}
                        loading="lazy"
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          backgroundColor: "grey.200",
                        }}
                      />
                      <ImageListItemBar
                        title={art.title}
                        subtitle={art.category || art.artType}
                        position="bottom"
                        sx={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
              {hasNextPage && (
                <div
                  ref={loadMoreTriggerRef}
                  style={{ height: "1px", margin: "30px 0 10px" }}
                />
              )}
              {moreArtsLoading && (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress size={30} />
                </Box>
              )}
            </Box>
          )}

          {/* --- SERVICES TAB --- */}
          {currentTab === "services" && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {servicesLoading && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  my={4}
                  sx={{ minHeight: "200px" }}
                >
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Cargando servicios...
                  </Typography>
                </Box>
              )}
              {servicesError && !servicesLoading && (
                <Alert severity="warning" sx={{ my: 2 }}>
                  {servicesError}
                </Alert>
              )}
              {!servicesLoading && !servicesError && services.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    backgroundColor: "grey.100",
                  }}
                >
                  <InfoOutlined
                    sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No se encontraron servicios
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Este prixer no tiene servicios listados actualmente.
                  </Typography>
                </Paper>
              )}
              {services.length > 0 && (
                <Grid2 container spacing={3}>
                  {services.map((service) => (
                    <Grid2
                      size={{ xs: 12, sm: 6 }}
                      key={service._id?.toString()}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "box-shadow 0.3s, transform 0.3s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 6,
                          },
                        }}
                      >
                        <img
                          src={
                            service.sources.images[0]?.url ||
                            "https://via.placeholder.com/300x200.png?text=No+Image"
                          }
                          alt={service.title}
                          style={{
                            width: "100%",
                            height: "180px",
                            objectFit: "cover",
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {service.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {service.description}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() =>
                              navigate(`/servicio/${service._id?.toString()}`)
                            }
                          >
                            Ver Servicio
                          </Button>
                        </Box>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              )}
            </Box>
          )}

          {/* --- ABOUT TAB --- */}
          {currentTab === "about" && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                my={2.5}
                alignItems="center"
              >
                {prixerLocation ? (
                  <Chip
                    icon={<InfoOutlined />}
                    label={prixerLocation}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Box />
                )}
                <Tooltip title="Share Profile">
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              <Grid2 container spacing={3} mb={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Teléfono:
                  </Typography>
                  {isEditMode ? (
                    <TextField
                      inputRef={fieldRefs.phone}
                      fullWidth
                      variant="standard"
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleFormChange("phone", e.target.value)
                      }
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  ) : phone ? (
                    <Link href={`tel:${phone}`} color="text.primary">
                      <Typography variant="body1">{phone}</Typography>
                    </Link>
                  ) : null}
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Redes:
                  </Typography>
                  {isEditMode ? (
                    <Stack spacing={1} mt={1}>
                      <TextField
                        inputRef={fieldRefs.instagram}
                        label="Instagram Handle"
                        fullWidth
                        variant="standard"
                        value={formData.instagram}
                        onChange={(e) =>
                          handleFormChange("instagram", e.target.value)
                        }
                        error={!!errors.instagram}
                        helperText={errors.instagram}
                      />
                      <TextField
                        inputRef={fieldRefs.twitter}
                        label="Twitter Handle"
                        fullWidth
                        variant="standard"
                        value={formData.twitter}
                        onChange={(e) =>
                          handleFormChange("twitter", e.target.value)
                        }
                        error={!!errors.twitter}
                        helperText={errors.twitter}
                      />
                      <TextField
                        inputRef={fieldRefs.facebook}
                        label="Facebook Path"
                        fullWidth
                        variant="standard"
                        value={formData.facebook}
                        onChange={(e) =>
                          handleFormChange("facebook", e.target.value)
                        }
                        error={!!errors.facebook}
                        helperText={errors.facebook}
                      />
                    </Stack>
                  ) : instagram || twitter || facebook ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {instagram && getSocialLink("instagram", instagram) && (
                        <IconButton
                          component="a"
                          href={getSocialLink("instagram", instagram) as string}
                          target="_blank"
                        >
                          <Instagram sx={{ color: "#E1306C" }} />
                        </IconButton>
                      )}
                      {twitter && getSocialLink("twitter", twitter) && (
                        <IconButton
                          component="a"
                          href={getSocialLink("twitter", twitter) as string}
                          target="_blank"
                        >
                          <Twitter sx={{ color: "#1DA1F2" }} />
                        </IconButton>
                      )}
                      {facebook && getSocialLink("facebook", facebook) && (
                        <IconButton
                          component="a"
                          href={getSocialLink("facebook", facebook) as string}
                          target="_blank"
                        >
                          <Facebook sx={{ color: "#1877F2" }} />
                        </IconButton>
                      )}
                    </Stack>
                  ) : null}
                </Grid2>
              </Grid2>

              {/* The Bio accordions are not editable in this implementation */}
              {((bio && bio.biography && bio.biography.length > 0) ||
                Object.keys(bio || {}).includes("biography")) && (
                <Accordion sx={{ mb: 1.5, "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Bio
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {bio?.biography?.[0] ? (
                      <Typography
                        component="div"
                        dangerouslySetInnerHTML={{ __html: bio.biography[0] }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No se encontró la bio.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {((bio && bio.images && bio.images.length > 0) ||
                Object.keys(bio || []).includes("images")) && (
                <Accordion sx={{ "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Imágenes Destacadas
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {(bio?.images?.length ?? 0) > 0 ? (
                      <ImageList
                        variant="masonry"
                        cols={isSmallScreen ? 2 : 3}
                        gap={8}
                      >
                        {(bio?.images ?? []).map((imgUrl, imgIndex) => (
                          <ImageListItem
                            key={imgIndex}
                            sx={{ cursor: "pointer" }}
                            onClick={() => handleOpenLightbox(imgUrl)}
                          >
                            <img
                              src={imgUrl}
                              alt={`Imagen Destacada ${imgIndex + 1}`}
                              loading="lazy"
                              style={{ borderRadius: "4px" }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Este prixer no posee imágenes destacadas.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ============================================= */}
      {/* MODALS & DIALOGS                              */}
      {/* ============================================= */}

      {/* --- Lightbox Modal for Artworks --- */}
      <Modal
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        closeAfterTransition
      >
        <Box sx={lightboxModalStyle}>
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.700",
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={lightboxImage}
            alt="Lightbox"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      </Modal>

      {/* --- Cropper Dialog for Avatar --- */}
      <Dialog
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Recorta tu avatar</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              minWidth={100}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: "70vh" }}
              />
            </ReactCrop>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmCropAndUpload}
            variant="contained"
            disabled={!completedCrop?.width}
          >
            Confirmar y subir
          </Button>
        </DialogActions>
      </Dialog>
      <ScrollToTopButton />

      {/* Hidden canvas for generating the blob */}
      <canvas
        ref={previewCanvasRef}
        style={{
          display: "none",
          width: 0,
          height: 0,
        }}
      />
    </>
  );
}
