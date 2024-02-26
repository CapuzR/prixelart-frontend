import * as React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

export function IconCard({ icon }) {
  return (
    <>
      <Card sx={{ maxWidth: 350 }}>
        <CardMedia
          component="img"
          sx={{ maxHeight: 200, margin: "auto", objectFit: "contain" }}
          image={icon?.src}
          title={icon?.name}
        />
        {icon ? (
          <>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {icon.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {icon.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Comparte</Button>
              <Button size="small" href={icon.mapUrl} target="_blank">
                Ir a Maps
              </Button>
            </CardActions>
          </>
        ) : (
          <CardContent>Selecciona un ícono</CardContent>
        )}
      </Card>
    </>
  );
}
