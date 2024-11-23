import { React, useState } from 'react';
import { makeStyles } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CarouselAdmin from './preferencesCarousel';
import TermsAndConditions from './preferenceTerms';
import BestSellers from './preferenceBestSellers';
import ArtBestSellers from './preferenceArtBestSellers';

function TabPanel(props) {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    'margin-left': '60px',
  },
}));

export default function SimpleTabs(props) {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Carrusel" style={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab
            label="Términos y condiciones"
            style={{ textTransform: 'none', fontWeight: 'bold' }}
          />
          <Tab
            label="Productos más vendidos"
            style={{ textTransform: 'none', fontWeight: 'bold' }}
          />
          <Tab label="Artes más vendidos" style={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <CarouselAdmin permissions={props.permissions} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TermsAndConditions permissions={props.permissions} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <BestSellers permissions={props.permissions} />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <ArtBestSellers
          permissions={props.permissions}
          setSearchResult={props.setSearchResult}
          searchResult={props.searchResult}
        />
      </TabPanel>
    </div>
  );
}
