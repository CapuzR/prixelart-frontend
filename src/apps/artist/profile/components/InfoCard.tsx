// Debo hacer los unit y functional tests.
import { makeStyles } from "tss-react/mui"
import Paper from "@mui/material/Paper"
import { useState, useEffect } from "react"

import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme, Theme } from "@mui/material/styles"
import { useLocation } from "react-router"

import Random from "./Random"
import ReadInfo from "./ReadInfo"
import EditInfo from "./EditInfo"
import { getPrixer, updatePrixer } from "../api"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      flexGrow: 1,
      width: "100%",
      display: "grid2",
    },
    paper: {
      padding: theme.spacing(2),
      margin: "auto",
      maxWidth: 616,
    },
    image: {
      width: 128,
      height: 128,
    },
    img: {
      margin: "auto",
      display: "block",
      maxWidth: "100%",
      maxHeight: "100%",
    },
    avatar: {
      display: "flex",
      "& > *": {},
      objectFit: "cover",
      backgroundColor: "#fff",
      width: "160px",
      height: "160px",
    },
  }
})

export default function InfoCard() {
  const { classes } = useStyles()
  let location = useLocation()
  const username = location.pathname.split("=")?.[1]
  const [prixerDataState, setPrixerDataState] = useState("read")
  const [email, setEmail] = useState<string>()
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [specialtyArt, setSpecialtyArt] = useState([])
  const [instagram, setInstagram] = useState<string>()
  const [facebook, setFacebook] = useState<string>()
  const [twitter, setTwitter] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [dateOfBirth, setDateOfBirth] = useState<string>()
  const [phone, setPhone] = useState<string>()
  const [country, setCountry] = useState<string>()
  const [city, setCity] = useState<string>()
  const [prixerExists, setPrixerExists] = useState(false)
  const [avatarObj, setAvatarObj] = useState("")
  const [profilePic, setProfilePic] = useState("")
  const [inputChange, setInputChange] = useState(false)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"))
  const [prixer, setPrixer] = useState()

  console.log(prixerDataState)

  const readPrixer = async () => {
    const response = await getPrixer(username)
    setEmail(response.email)
    setFirstName(response.firstName)
    setLastName(response.lastName)
    setSpecialtyArt(response.specialtyArt)
    setInstagram(response.instagram)
    setFacebook(response.facebook)
    setTwitter(response.twitter)
    setDescription(response.description)
    setDateOfBirth(response.dateOfBirth)
    setPhone(response.phone)
    setCountry(response.country)
    setCity(response.city)
    setAvatarObj(response.avatar)
    setProfilePic(response.avatar)
    setPrixer(response)
    setPrixerExists(true)
  }

  useEffect(() => {
    readPrixer()
  }, [])

  const handleProfileDataEdit = async () => {
    if (prixerDataState === "edit") {
      var formData = new FormData()
      // if (profilePic !== "") {
      //   formData.append("avatar", profilePic);
      // }
      formData.append("avatar", profilePic || avatarObj)
      formData.append("username", username)
      formData.append("firstName", firstName)
      formData.append("email", email)
      formData.append("lastName", lastName)
      formData.append("specialtyArt", specialtyArt.join())
      formData.append("instagram", instagram)
      formData.append("facebook", facebook)
      formData.append("twitter", twitter)
      formData.append("description", description)
      formData.append("dateOfBirth", dateOfBirth)
      formData.append("phone", phone)
      formData.append("country", country)
      formData.append("city", city)

      const response = await updatePrixer(formData)
      setPrixerDataState("read")

      if (response.data) {
        setEmail(response.data.email)
        setFirstName(response.data.firstName)
        setLastName(response.data.lastName)
        setSpecialtyArt(response.data.specialtyArt)
        setInstagram(response.data.instagram)
        setFacebook(response.data.facebook)
        setTwitter(response.data.twitter)
        setDescription(response.data.description)
        setDateOfBirth(response.data.dateOfBirth)
        setPhone(response.data.phone)
        setCountry(response.data.country)
        setCity(response.data.city)
        setAvatarObj(response.data.avatar)
        setProfilePic(response.data.avatar)
        setPrixerExists(true)

        // props.setFeed("Artes")
      } else {
      }
    } else {
      setPrixerDataState("edit")
      // props.setFeed("Settings")
    }
  }

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true)
      setAvatarObj(URL.createObjectURL(e.target.files[0]))
      setProfilePic(e.target.files[0])
    }
  }

  const handleChange = (e) => {
    setSpecialtyArt(e.target.value)
  }

  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 300) {
      setDescription(e.target.value)
    }
  }
  return prixerExists ? (
    <div className={classes.root}>
      <Paper
        elevation={3}
        className={classes.paper}
        style={{ width: isDesktop ? "50%" : "100%", margin: "0 auto" }}
      >
        {/* Optimizar para llevar a una única maqueta y no duplicar dependiendo del estado */}
        {prixerDataState === "read" ? (
          <ReadInfo
            avatarObj={avatarObj}
            profilePic={profilePic}
            username={username}
            handleProfileDataEdit={handleProfileDataEdit}
            firstName={firstName}
            lastName={lastName}
            prixer={prixer}
            specialtyArt={specialtyArt}
            description={description}
            instagram={instagram}
            facebook={facebook}
            twitter={twitter}
          />
        ) : prixerDataState === "edit" && (
          <EditInfo
            avatarObj={avatarObj}
            username={username}
            onImageChange={onImageChange}
            handleProfileDataEdit={handleProfileDataEdit}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            prixer={prixer}
            specialtyArt={specialtyArt}
            setSpecialtyArt={setSpecialtyArt}
            description={description}
            handleDescription={handleDescription}
            instagram={instagram}
            setInstagram={setInstagram}
            facebook={facebook}
            setFacebook={setFacebook}
            twitter={twitter}
            setTwitter={setTwitter}
            handleChange={handleChange}
          />
        )}
      </Paper>
    </div>
  ) : (
    <Random />
  )
}
