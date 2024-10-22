export const searchPhotos = (
  queryValue,
  categories,
  history,
  props,
  globalParams
) => {
  const basePath = window.location.pathname.includes("producto=")
    ? window.location.pathname
    : "/galeria"
  const isPrixer = props.prixerUsername || globalParams.get("prixer")
  const prixerParam = isPrixer ? `?prixer=${isPrixer}` : ""
  const queryParams = new URLSearchParams()
  if (categories && categories.length > 0) {
    queryParams.append("category", categories)
  }
  if (queryValue) {
    queryParams.append("name", queryValue)
  }
  const finalPath = isPrixer
    ? `${basePath}/s${prixerParam}${
        queryParams.toString() ? "&" + queryParams.toString() : ""
      }`
    : `${basePath}/s${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`
  history.push({ pathname: finalPath })
}

export const handleFullImage = async (
  e,
  tile,
  props,
  history,
  setOpenFullArt
) => {
  props.setFullArt(tile)
  props.setSearchResult(props.tiles)
  const artId = e.target.id
  history.push({
    pathname: `/art=${artId}`,
  })
  setOpenFullArt(true)
}

export const addingToCart = (e, tile, setSelectedArt, setIsOpenAssociateProduct) => {
  e.preventDefault()
  const isProductPage = window.location.search.includes("producto=")
  setSelectedArt(tile)
  if (!isProductPage) {
    setIsOpenAssociateProduct(true)
  }
}
