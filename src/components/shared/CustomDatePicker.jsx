import { View } from 'react-native';
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from "../react-native-ui-datepicker";

import { COLORS } from '../../utils/constants';

export function CustomDatePicker({ value, setValue }) {
  const defaultStyles = useDefaultStyles();

  return (
    <DateTimePicker
          mode="single"
          timePicker={true}
          date={value}
          onChange={({ date }) => setValue(date)}
          styles={{
            ...defaultStyles,
            day_label: { color: COLORS.neutral40 },
            month_selector_label: { color: COLORS.neutral40 },
            year_selector_label: { color: COLORS.neutral40 },
            month_label: { color: COLORS.neutral40 },
            year_label: { color: COLORS.neutral40 },
            time_label: { color: COLORS.neutral40 },
            time_selector_label: { color: COLORS.neutral40 },
            time_selected_indicator: {
              backgroundColor: COLORS.primary,
              borderRadius: 8,
            },
            selected: { backgroundColor: COLORS.primary, borderRadius: 8 },
            selected_label: { color: 'white' },
            today: { backgroundColor: COLORS.neutral60 },
            button_next: { backgroundColor: COLORS.tint5, borderRadius: 8 },
            button_prev: { backgroundColor: COLORS.tint5, borderRadius: 8 },
          }}
        />
  );
}
