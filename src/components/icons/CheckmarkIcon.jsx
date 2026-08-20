import Svg, { Path } from "react-native-svg"

const CheckmarkIcon = ({width = 24, height = 24, ...props}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 11 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M3.96875 8.25L0.40625 4.6875L1.29688 3.79688L3.96875 6.46875L9.70313 0.734375L10.5938 1.625L3.96875 8.25Z"
      fill="#a6ff00"
    />
  </Svg>
);
export default CheckmarkIcon;
