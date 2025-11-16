const Art = require("./artModel")
const { organizeArtData } = require("../utils/util")
const mongoose = require("mongoose")
const accents = require("remove-accents")
const axios = require("axios")

//CRUD
const createArt = async (artData) => {
  // const isArt = false
  try {
    // if (isArt) {
    //   return {
    //     success: false,
    //     message: "Disculpa, este arte ya fue creado.",
    //   }
    // } else {
    const newArt = await new Art(organizeArtData(artData)).save()
    if (newArt) {
      return {
        success: true,
        artData: newArt,
      }
    } else {
      return {
        success: false,
        message: "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
      }
    }
    // }
  } catch (e) {
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo cargar tu arte, inténtalo de nuevo por favor.",
    }
  }
}

const readOneById = async (artSystemId) => {
  try {
    const readedArt = await Art.findOne({ artId: artSystemId, visible: true })
      // .select("-__v -imageUrl")
      // .sort({ points: -1, visible: -1 })
      .exec()
    const createdOn = new mongoose.Types.ObjectId(readedArt._id)
    const date = createdOn.getTimestamp()
    readedArt.createdOn = date
    if (readedArt) {
      const data = {
        info: "Yei. Enjoy",
        arts: readedArt,
      }

      return data
    } else {
      const data = {
        info: "Interesante, este arte no existe. Por favor inténtalo de nuevo.",
        arts: null,
      }
      return data
    }
  } catch (e) {
    console.log(e)
    return e
  }
}

const randomArts = async () => {
  try {
    const readedArts = await Art.find({ visible: true })

    const docCount = await Art.estimatedDocumentCount()
    var random = Math.floor(Math.random() * docCount)
    const readedArt = readedArts[random]
    if (readedArts) {
      const data = {
        info: "Sorpresa...",
        arts: readedArt,
      }

      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readByUserIdByQuery = async (user, query) => {
  try {
    const text = accents.remove(query).toLowerCase()
    const readedArts = await Art.find({ prixerUsername: user, visible: true })
      .select("-__v -imageUrl -crops -status")
      .exec()
    const specifyArt = await Art.findOne({ artId: query, visible: true })
    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase()
      const artDescription = accents.remove(art.description).toLowerCase()
      const artLocation = accents.remove(art.artLocation).toLowerCase()
      const artTags = art.tags.map((tag) => {
        const tags = accents.remove(tag).toLowerCase()
        return tags
      })
      if (art.category) {
        const artCategory = accents.remove(art.category).toLowerCase()

        return (
          artTitle.includes(text) ||
          artDescription.includes(text) ||
          artCategory.includes(text) ||
          artLocation.includes(text) ||
          artTags.includes(text)
        )
      }
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artLocation.includes(text) ||
        artTags.includes(text)
      )
    })
    if (specifyArt !== null) {
      const data = {
        info: "El arte que buscas",
        arts: [specifyArt],
      }
      return data
    } else if (filterArts) {
      const data = {
        info: "Todos los artes del Prixer disponibles",
        arts: filterArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readByUserIdAndCategory = async (user, query) => {
  try {
    const readedArts = await Art.find({
      prixerUsername: user,
      category: query,
      visible: true,
    })
      .select("-__v -imageUrl -crops -status")
      .exec()
    if (readedArts) {
      const data = {
        info: "Todos los artes del Prixer disponibles",
        arts: readedArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readByUserIdQueryAndCategory = async (user, query) => {
  try {
    const text = accents.remove(query.text).toLowerCase()
    const category = query.category
    const readedArts = await Art.find({
      prixerUsername: user,
      category: category,
      visible: true,
    })
      .select("-__v -imageUrl -crops -status")
      .exec()
    const specifyArt = await Art.find({ artId: query.text, visible: true })
    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase()
      const artDescription = accents.remove(art.description).toLowerCase()
      const artLocation = accents.remove(art.artLocation).toLowerCase()
      const artTags = art.tags.map((tag) => {
        const tags = accents.remove(tag).toLowerCase()
        return tags
      })
      if (art.category) {
        const artCategory = accents.remove(art.category).toLowerCase()

        return (
          artTitle.includes(text) ||
          artDescription.includes(text) ||
          artCategory.includes(text) ||
          artLocation.includes(text) ||
          artTags.includes(text)
        )
      }
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artLocation.includes(text) ||
        artTags.includes(text)
      )
    })
    if (specifyArt) {
      const data = {
        info: "El arte que buscas",
        arts: specifyArt,
      }
      return data
    } else if (filterArts) {
      const data = {
        info: "Todos los artes del Prixer disponibles",
        arts: filterArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllArts = async () => {
  try {
    const readedArts = await Art.find()
      .sort({ points: -1, visible: -1 })
      .select("-__v -imageUrl -crops -status")
      .exec()
    if (readedArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: readedArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return {
      info: "Transcurrió demasiado tiempo, inténtalo de nuevo",
      arts: null,
    }
  }
}

const readAllArtsv2 = async () => {
  try {
    const readedArts = await Art.find({ visible: true })
      .sort({ points: -1, visible: -1 })
      .select("-__v -imageUrl -crops -status")
      .exec()

    // readedArts.forEach((art) => {
    //   const createdOn = new mongoose.Types.ObjectId(art._id).getTimestamp()
    //   art.createdOn = createdOn
    // })

    if (readedArts) {
      const data = {
        info: "Todos los artes visibles",
        arts: readedArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return {
      info: "Transcurrió demasiado tiempo, inténtalo de nuevo",
      arts: null,
    }
  }
}

const readLatest = async () => {
  try {
    const readedArts = await Art.find({ visible: true })
      // .sort({ points: -1, visible: -1 })
      .select("-__v -imageUrl -crops -status")
      .exec()

    const v2 = []
    readedArts.map((art) => {
      const createdAt = new mongoose.Types.ObjectId(art._id)
      const date = createdAt.getTimestamp()
      art.createAt = date
      // art.createAt = createdAt
      delete art._id
      v2.push(art)
    })
    v2.reverse()
    const v3 = v2.slice(0, 20)
    if (readedArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: v3,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return {
      info: "Transcurrió demasiado tiempo, inténtalo de nuevo",
      arts: null,
    }
  }
}

const readByQueryAndCategory = async (query) => {
  try {
    const text = accents.remove(query.text).toLowerCase()
    const category = query.category
    const readedArts = await Art.find({ category: category, visible: true })
      .select("-__v -imageUrl -crops -status")
      .exec()
    const specifyArt = await Art.find({ artId: query.text, visible: true })

    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase()
      const artDescription = accents.remove(art.description).toLowerCase()
      const artLocation = accents.remove(art.artLocation).toLowerCase()
      const artTags = art.tags.map((tag) => {
        const tags = accents.remove(tag).toLowerCase()
        return tags
      })
      if (art.category) {
        const artCategory = accents.remove(art.category).toLowerCase()

        return (
          artTitle.includes(text) ||
          artDescription.includes(text) ||
          artCategory.includes(text) ||
          artLocation.includes(text) ||
          artTags.includes(text)
        )
      }
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artLocation.includes(text) ||
        artTags.includes(text)
      )
    })
    if (specifyArt) {
      const data = {
        info: "El arte que buscas",
        arts: specifyArt,
      }
      return data
    } else if (filterArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: filterArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readByQuery = async (query) => {
  try {
    const text = accents.remove(query.text).toLowerCase()
    const readedArts = await Art.find({ visible: true })
      .select("-__v -imageUrl -crops -status")
      .exec()
    const specifyArt = await Art.findOne({ artId: query.text, visible: true })
    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase()
      const artDescription = accents.remove(art.description).toLowerCase()
      const artLocation = accents.remove(art.artLocation).toLowerCase()
      const artTags = art.tags.map((tag) => {
        const tags = accents.remove(tag).toLowerCase()
        return tags
      })
      if (art.category) {
        const artCategory = accents.remove(art.category).toLowerCase()
        return (
          artTitle.includes(text) ||
          artDescription.includes(text) ||
          artCategory.includes(text) ||
          artLocation.includes(text) ||
          artTags.includes(text)
        )
      }
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artLocation.includes(text) ||
        artTags.includes(text)
      )
    })

    if (specifyArt !== null) {
      const data = {
        info: "El arte que buscas",
        arts: [specifyArt],
      }
      return data
    } else if (filterArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: filterArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readByCategory = async (query) => {
  try {
    const category = query.category
    const readedArts = await Art.find({ category: category, visible: true })
      .select("-__v -imageUrl -crops -status")
      .exec()
    if (readedArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: readedArts,
      }
      return data
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllByUserId = async (userId) => {
  try {
    const readedArts = await Art.find({ userId: userId, visible: true })
      .select("-__v -imageUrl -crops -status")
      .exec()
    if (readedArts) {
      const data = {
        info: "El Prixer sí tiene artes registrados",
        arts: readedArts,
      }

      return data
    } else {
      const data = {
        info: "El Prixer no tiene artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllByUserIdV2 = async (username) => {
  try {
    const readedArts = await Art.find({
      prixerUsername: username,
      visible: true,
    })
      .select("-__v -imageUrl -crops -status")
      .exec()

    readedArts.forEach((art) => {
      const createdOn = new mongoose.Types.ObjectId(art?._id).getTimestamp()
      art.createdOn = createdOn
    })

    if (readedArts) {
      const data = {
        info: "El Prixer sí tiene artes registrados",
        arts: readedArts,
        username: username,
      }
      return data
    } else {
      const data = {
        info: "El Prixer no tiene artes registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const getOneById = async (artId) => {
  try {
    const readedArts = await Art.find({ artId: artId, visible: true })
      // .sort({ points: -1, visible: -1 })
      .select("-__v -imageUrl -crops -status")
      .exec()

    if (readedArts) {
      const data = {
        info: "Arte encontrado",
        arts: readedArts,
      }

      return data
    } else {
      const data = {
        info: "El arte especificado no existe",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const updateArt = async (artId, artData) => {
  try {
    const toUpdateArt = await Art.findOne({ artId })
    // toUpdateArt.set(art);
    // const toUpdateArt = await Art.findByIdAndUpdate(artId);
    // toUpdateArt.artId = artData.artId;
    toUpdateArt.title = artData.title
    toUpdateArt.category = artData.category
    toUpdateArt.description = artData.description
    toUpdateArt.tags = artData.tags
    toUpdateArt.artType = artData.artType
    toUpdateArt.artLocation = artData.artLocation
    toUpdateArt.exclusive = artData.exclusive
    toUpdateArt.comission = artData.comission
    // toUpdateArt.imageUrl = artData.imageUrl;
    // toUpdateArt.thumbnailUrl = artData.thumbnail;
    // toUpdateArt.largeThumbUrl = artData.largeThumbUrl;
    // toUpdateArt.mediumThumbUrl = artData.mediumThumbUrl;
    // toUpdateArt.smallThumbUrl = artData.smallThumbUrl;
    // toUpdateArt.squareThumbUrl = artData.squareThumbUrl;
    // toUpdateArt.userId = artData.userId;
    // toUpdateArt.prixerUsername = artData.prixerUsername;
    // toUpdateArt.status = artData.status;
    // toUpdateArt.publicId = artData.publicId;
    // toUpdateArt.originalPhotoWidth = originalPhotoWidth;
    // toUpdateArt.originalPhotoHeight = originalPhotoHeight;
    // toUpdateArt.originalPhotoIso = originalPhotoIso;
    // toUpdateArt.originalPhotoPpi = originalPhotoPpi;
    // toUpdateArt.crops = crops;

    const updatedArt = await toUpdateArt.save()
    if (!updatedArt) {
      return console.log("Art update error: " + err)
    }
    return "Actualización realizada con éxito."
  } catch (error) {
    console.log(error)
    return error
  }
}

const disableArt = async (artId, artData) => {
  try {
    const toUpdateArt = await Art.findOne({ artId })
    toUpdateArt.disabledReason = artData.disabledReason
    toUpdateArt.visible = Boolean(artData.visible)

    const updatedArt = await toUpdateArt.save()
    if (!updatedArt) {
      return console.log("Art update error: " + err)
    }
    return "Actualización realizada con éxito."
  } catch (error) {
    console.log(error)
    return error
  }
}

const unableArts = async (username) => {
  try {
    const change = await Art.updateMany(
      { prixerUsername: username },
      { visible: false }
    )

    return `${change.nModified} documentos de Arte actualizados.`
  } catch (error) {
    console.log(error)
    return error
  }
}

const rankArt = async (artId, artData) => {
  try {
    const fromRank = await Art.findOne({ artId })

    fromRank.points = parseInt(artData.points)
    fromRank.certificate = artData.certificate

    const artRankUpdated = await fromRank.save()

    if (!artRankUpdated) {
      return "Art update error"
    }
    return "Actualización realizada con éxito"
  } catch (error) {
    console.log(error)
    return error
  }
}

const deleteArt = async (artId) => {
  try {
    await Art.findOneAndDelete({ artId: artId })
    return "Arte eliminado exitosamente"
  } catch (error) {
    console.log(error)
    return error
  }
}

const getBestSellers = async (orders) => {
  try {
    const allArts = await Art.find({ visible: true })
    let arts = []

    allArts.map((art) => {
      arts.push({ name: art.title, quantity: 0 })
    })

    await orders.orders.map(async (order) => {
      await order?.requests?.map(async (item) => {
        await arts.find((element) => {
          if (element.name === item?.art?.title) {
            element.quantity = element.quantity + 1
          }
        })
      })
    })

    const artv2 = arts
      .sort(function (a, b) {
        return b.quantity - a.quantity
      })
      .slice(0, 10)

    const artv3 = allArts.filter((art) =>
      artv2.some((ref) => ref.name === art.title)
    )

    const data = {
      info: "Estas son las obras más vendidas",
      ref: artv2,
      arts: artv3,
    }
    return data
  } catch (error) {
    console.log(error)
    return error
  }
}

const searchUrl = async (id) => {
  try {
    const readedArt = await Art.find({ artId: id, visible: true })
    if (readedArt.length === 0) {
      throw new Error(
        "Arte no encontrado, tal vez o no es visible o no existe."
      )
    }

    const urlArt = readedArt[0].smallThumbUrl?.replace(/ /gi, "_")
    if (!urlArt) {
      throw new Error("URL de imagen no encontrada.")
    }

    const response = await axios.get(urlArt, { responseType: "arraybuffer" })
    const imageBuffer = Buffer.from(response.data, "binary")
    return imageBuffer
  } catch (error) {
    console.error("Error fetching images:", error)
    throw error
  }
}
// const searchUrl = async (id) => {
//   try {
//     const readedArt = await Art.find({ artId: id });
//     const urlArt = readedArt[0].smallThumbUrl?.replace(/ /gi, "_");
//     const response = await axios.get(urlArt, {
//       responseType: "arraybuffer",
//     });
//     const imageBuffer = Buffer.from(response.data, "binary");
//     return imageBuffer;
//   } catch (error) {
//     // console.log(error);
//     return error;
//   }
// };

const removeArt = async () => {
  // const removedPrixers = await Prixer.deleteMany({});
  // if(removedPrixers) {
  //     return 'Se eliminaron: ' + removedPrixers;
  // } else {
  //     return removedPrixers;
  // }
}
//CRUD END

module.exports = {
  createArt,
  readByUserIdByQuery,
  readByUserIdAndCategory,
  readByUserIdQueryAndCategory,
  readAllArts,
  readAllArtsv2,
  readLatest,
  readByQueryAndCategory,
  readByQuery,
  readByCategory,
  randomArts,
  readAllByUserId,
  readAllByUserIdV2,
  getOneById,
  readOneById,
  updateArt,
  disableArt,
  unableArts,
  deleteArt,
  removeArt,
  rankArt,
  getBestSellers,
  searchUrl,
}
