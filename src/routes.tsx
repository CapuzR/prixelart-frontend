import React, { useEffect, useState } from "react"
import expire from "./utils/expire"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { useLocation, useParams } from "react-router"

import ArtistRoutes from "apps/artist/artist.routes"
import AdminRoutes from "apps/admin/admin.routes"
import ConsumerRoutes from "apps/consumer/consumer.routes"
import MapRoutes from "apps/map/map.routes"
import OrgsRoutes from "apps/orgs/orgs.routes"

const Routes = () => {
  const [valuesConsumerForm, setValuesConsumerForm] = useState<string>("")
  let location = useLocation()
  const section = location.pathname.split("/")[1]
  const hostname = window.location.hostname
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
        valuesConsumerForm={valuesConsumerForm}
        setValuesConsumerForm={setValuesConsumerForm}
      />
      <ArtistRoutes />
      <MapRoutes />
      <OrgsRoutes />
      <ConsumerRoutes />
    </>
  )
}

export default Routes
