import TextField from "@mui/material/TextField";
type Props = {
  name: string;
  type: string;
  label: string;
};
const CustomizedInput = (props: Props) => {
  return (
    <TextField
      margin="normal"
      InputLabelProps={{ style: { fontSize: 25, color: "purple" } }}
      name={props.name}
      label={props.label}
      type={props.type}
      InputProps={{
        style: {
          width: "450px",
          borderRadius: 10,
          fontSize: 35,
          color: "cyan",
        },
      }}
    />
  );
};

export default CustomizedInput;
