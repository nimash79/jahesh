import { Text } from 'react-native';

const CustomText = ({ style, children, ...props }) => {
  return (
    <Text
      {...props}
      style={[{ fontFamily: 'Shabnam-Regular' }, style]}
    >
      {children}
    </Text>
  );
};

export default CustomText;
