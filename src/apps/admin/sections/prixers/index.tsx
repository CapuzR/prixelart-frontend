import { useState, useEffect } from "react"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import { useTheme } from "@mui/material/styles"

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import CreateWallet from "./components/CreateWallet"
import CreateMovement from "./components/CreateMovement"
import MovementRecord from "./components/MovementRecord"
import PrixerInfo from "./components/Info"
import OrgCommission from "./components/OrgCommission"
// import RemovePrixer from "./destroyPrixer"

import {
  getAllPrixers,
  getAllOrgs,
  getAccounts,
  updateToOrg,
  updateToPrixer,
  updateVisibility,
} from "./api"
import { getPrixers } from "../consumers/api"
import Grid from "./components/Grid"
import { Account } from "../../../../types/account.types"
import { useSnackBar, useLoading, getPermissions } from "context/GlobalContext"
import OrgsGrid from "./components/OrgsGrid"
import { Prixer } from "../../../../types/prixer.types"
import { Organization } from "../../../../types/organization.types"
import { Consumer } from "../../../../types/consumer.types"

export default function PrixersCrud() {
  const theme = useTheme()

  const [value, setValue] = useState(0)
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const [tiles, setTiles] = useState([])
  const [consumers, setConsumers] = useState([])
  const [orgs, setOrgs] = useState([])
  const [state, setState] = useState({
    checkedA: true,
  })
  const [openNewBalance, setOpenNewBalance] = useState(false)
  const [openNewMovement, setOpenNewMovement] = useState(false)
  const [openList, setOpenList] = useState(false)
  const [selectedPrixer, setSelectedPrixer] = useState<Prixer | undefined>(undefined)
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | undefined>(undefined)
  const [balance, setBalance] = useState<number | string>(0)
  const [type, setType] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [accounts, setAccounts] = useState<Account[]>([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [openInfo, setOpenInfo] = useState(false)
  const [openComission, setOpenComission] = useState(false)
  const [openDestroy, setOpenDestroy] = useState(false)

  const handleSection = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const readPrixers = async () => {
    try {
      const response = await getAllPrixers()
      setTiles(response)
    } catch (error) {
      console.log(error)
    }
  }

  const readConsumers = async () => {
    try {
      const response = await getPrixers()
      setConsumers(response)
    } catch (error) {
      console.log(error)
    }
  }

  const readOrg = async () => {
    try {
      const response = await getAllOrgs()
      setOrgs(response)
    } catch (error) {
      console.log(error)
    }
  }

  const getBalance = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response)
    } catch (error) {
      console.log(error)
    }
  }

  const routine = () => {
    setLoading(true)
    readPrixers()
    readOrg()
    readConsumers()
    getBalance()
  }

  useEffect(() => {
    routine()
  }, [])

  // const handleChange = (event) => {
  //   setState({ ...state, [event.target.name]: event.target.checked })
  // }

  const ChangeVisibility = async (e: React.ChangeEvent<HTMLInputElement>, prixer: Prixer) => {
    e.preventDefault()
    setLoading(true)
    setState({ ...state, [e.target.name]: e.target.checked })

    const body = {
      status:
        e.target.value === "false" || e.target.value === "" ? true : false,
      account: prixer?.account,
      id: prixer.prixerId,
    }
    // Simplificar esto
    const response = await updateVisibility(body)
    if (response.success) {
      // Personalizar a true o false
      showSnackBar(`Visibilidad de usuario ${prixer.username} cambiada.`)
      await readPrixers()
    }
  }

  const handleClose = () => {
    setOpenNewBalance(false)
    setOpenNewMovement(false)
    setOpenComission(false)
    setOpenList(false)
    setBalance(0)
    setOpenInfo(false)
    setSelectedPrixer(undefined)
    setSelectedConsumer(undefined)
    setDate(new Date())
    setAnchorEl(null)
    setOpenDestroy(false)
  }
  interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box p={3}>
            <>{children}</>
          </Box>
        )}
      </div>
    )
  }

  const TurnIntoOrg = async (event: React.ChangeEvent<HTMLInputElement>, user: string) => {
    const response = await updateToOrg(user)
    if (response.success) {
      showSnackBar("Rol modificado a Organización.")
      let prev = tiles.filter((tile: Prixer) => tile.username !== user)
      setTiles(prev)
    }
  }

  const TurnIntoPrixer = async (event: React.ChangeEvent<HTMLInputElement>, user: string) => {
    const response = await updateToPrixer(user)
    if (response.success) {
      showSnackBar("Rol modificado a Prixer.")
      let prev = orgs.filter((o: Organization) => o.username !== user)
      if (prev[0] === null) {
        setOrgs([])
      } else {
        setOrgs(prev)
      }
    }
  }

  return (
    <div>
      <Paper sx={{ padding: theme.spacing(2), margin: "15px" }}>
        <Tabs
          value={value}
          onChange={handleSection}
          style={{ width: "70%" }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Prixers" />
          <Tab label="Organizaciones" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Grid
            tiles={tiles}
            selectedPrixer={selectedPrixer}
            setSelectedPrixer={setSelectedPrixer}
            permissions={permissions}
            consumers={consumers}
            setSelectedConsumer={setSelectedConsumer}
            TurnInto={TurnIntoOrg}
            ChangeVisibility={ChangeVisibility}
            setOpenDestroy={setOpenDestroy}
            accounts={accounts}
            setType={setType}
            setOpenNewMovement={setOpenNewMovement}
            setOpenList={setOpenList}
            setOpenNewBalance={setOpenNewBalance}
            setOpenInfo={setOpenInfo}
            setOpenComission={setOpenComission}
            org={false}
          />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Grid
            tiles={orgs}
            selectedPrixer={selectedPrixer}
            setSelectedPrixer={setSelectedPrixer}
            permissions={permissions}
            consumers={consumers}
            setSelectedConsumer={setSelectedConsumer}
            ChangeVisibility={ChangeVisibility}
            setOpenDestroy={setOpenDestroy}
            accounts={accounts}
            setType={setType}
            setOpenNewMovement={setOpenNewMovement}
            setOpenList={setOpenList}
            setOpenNewBalance={setOpenNewBalance}
            setOpenInfo={setOpenInfo}
            TurnInto={TurnIntoPrixer}
            org={true}
            setOpenComission={setOpenComission}
          />
        </TabPanel>
      </Paper>

      <Modal
        open={openNewBalance}
        onClose={handleClose}
        sx={{ display: "flex" }}
      >
        <CreateWallet
          selectedPrixer={selectedPrixer}
          balance={balance}
          date={date}
          showSnackBar={showSnackBar}
          handleClose={handleClose}
          setBalance={setBalance}
          readPrixers={readPrixers}
          readOrg={readOrg}
          getBalance={getBalance}
        />
      </Modal>

      <Modal
        open={openNewMovement}
        onClose={handleClose}
        sx={{ display: "flex" }}
      >
        <CreateMovement
          selectedPrixer={selectedPrixer}
          handleClose={handleClose}
          date={date}
          setDate={setDate}
          balance={balance}
          setBalance={setBalance}
          type={type}
          showSnackBar={showSnackBar}
          readPrixers={readPrixers}
          readOrg={readOrg}
          getBalance={getBalance}
        />
      </Modal>

      <Modal open={openList} onClose={handleClose} sx={{ display: "flex" }}>
        <MovementRecord
          selectedPrixer={selectedPrixer}
          handleClose={handleClose}
        />
      </Modal>

      <Modal open={openInfo} onClose={handleClose}>
        <PrixerInfo
          selectedPrixer={selectedPrixer}
          selectedConsumer={selectedConsumer}
          handleClose={handleClose}
        />
      </Modal>

      <Modal open={openComission} onClose={handleClose}>
        <OrgCommission
          selectedPrixer={selectedPrixer}
          handleClose={handleClose}
          setOpenComission={setOpenComission}
          readOrg={readOrg}
        />
      </Modal>

      {/* <Modal open={openDestroy} onClose={handleClose}>
        <RemovePrixer
          selectedPrixer={selectedPrixer}
          selectedConsumer={selectedConsumer}
          routine={routine}
          handleClose={handleClose}
          org={value === 1 ? true : false}
        />
      </Modal> */}
    </div>
  )
}
