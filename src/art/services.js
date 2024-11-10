export const searchPhotos = (
  queryValue,
  categories,
  history,
  prixerUsername,
  globalParams,
  // isFlow
) => {
  // const basePath = window.location.pathname.includes("producto=")
  //   ? window.location.pathname
  //   : "/galeria"
  // console.log("SERVICES - searchPhotos - window.location", window.location.pathname);
  const basePath = window.location.pathname;
  const isPrixer = prixerUsername || globalParams.get("prixer")
  const prixerParam = isPrixer ? `?prixer=${isPrixer}` : ""
  // const flowParam = isFlow ? `flow=${isFlow}` : ""
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
  return finalPath;
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

export const addingToCart = (e, tile, setSelectedArt) => {
  e.preventDefault()
  setSelectedArt(tile)
}
