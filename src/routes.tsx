import { useEffect } from "react"
import expire from "./utils/expire"

import ArtistRoutes from "apps/artist/artist.routes"
import AdminRoutes from "apps/admin/admin.routes"
import ConsumerRoutes from "apps/consumer/consumer.routes"

const Routes = () => {
  useEffect(() => {
    const disableRightClick = (event: MouseEvent) => {
      event.preventDefault()
    }

    document.addEventListener("contextmenu", disableRightClick)

    return () => {
      document.removeEventListener("contextmenu", disableRightClick)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem("token")) {
      expire("token", "tokenExpire")
    } else if (localStorage.getItem("adminToken")) {
      expire("adminToken", "adminTokenExpire")
    }
  }, [])

  return (
    <>
      <AdminRoutes />
      <ArtistRoutes />
      <ConsumerRoutes />
    </>
  )
}

export default Routes
