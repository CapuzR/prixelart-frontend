import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    // backgroundColor: theme.palette.background.paper,
    paddingTop: 0,
  },
}));

export const IconsList = ({ icons, setSelectedIcon, setOpenSelected }) => {
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width:1090px)');

  return (
    <div style={{ marginLeft: isMobile && 10, zIndex: 2 }}>
      <Typography
        style={{
          display: 'flex',
          width: '100%',
          fontWeight: 'bold',
          fontSize: '1.2rem',

          color: '#f69618',
          marginTop: 20,
          marginBottom: 5,
        }}
      >
        Obras
      </Typography>

      <div
        className={classes.root}
        style={{
          width: isMobile && '45%',
          zIndex: 1,
        }}
      >
        {icons.map((icon, index) => {
          return (
            <a
              onClick={(e) => {
                setSelectedIcon(icon);
                setOpenSelected(true);
              }}
            >
              <div
                key={index}
                style={{
                  padding: isMobile && 0,
                  paddingTop: isMobile && '-50px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 5,
                }}
              >
                <Typography
                  style={{
                    fontSize: '1.3rem',
                    color: index % 2 === 0 ? '#72cddb' : '#f69618',
                    paddingLeft: icon.text.length === 1 && 10,
                  }}
                >
                  {icon.text}
                </Typography>
                <Typography
                  style={{
                    fontSize: '0.8rem',
                    lineHeight: '1',
                    color: '#404e5c',
                  }}
                >
                  {' ' + icon.name}
                </Typography>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
