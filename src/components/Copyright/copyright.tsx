import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Copyright(props: any) {
  return (
    <Typography
      {...props}
      variant="body2"
      color="textSecondary"
      align="center"
      sx={{ fontFamily: "Ubuntu, sans-serif", ...props.sx }}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://prixelart.com/" underline="hover">
        prixelart.com
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
