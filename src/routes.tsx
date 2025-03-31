import React, { useEffect } from "react"
import expire from "./utils/expire"
import { useLocation } from "react-router"

import ArtistRoutes from "apps/artist/artist.routes"
import AdminRoutes from "apps/admin/admin.routes"
import ConsumerRoutes from "apps/consumer/consumer.routes"
import MapRoutes from "apps/map/map.routes"
// import OrgsRoutes from "apps/orgs/orgs.routes"

const Routes = () => {
  let location = useLocation()
  const section = location.pathname.split("/")[1]
  console.log(location)
  console.log(section)

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault()
  })

  useEffect(() => {
    if (localStorage.getItem("token")) {
      expire("token", "tokenExpire")
    } else if (localStorage.getItem("adminToken")) {
      expire("adminToken", "adminTokenExpire")
    }
  }, [])

  return (
    <>
      <AdminRoutes
      />
      {/* <ArtistRoutes /> */}
      {/* <MapRoutes /> */}
      {/* <OrgsRoutes /> */}
      {/* <ConsumerRoutes /> */}
    </>
  )
}

export default Routes
