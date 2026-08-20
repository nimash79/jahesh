import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

import { MemDesign } from '../memory/MemDesign';
import { useSelector } from 'react-redux';

const bytesToHex = bytes =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

const getPhoneNumberAsNumber = (d) => {
  if (!d || d.length < 6) return 0;
  return d[1] + d[2] * 256 + d[3] * 65536 + d[4] * 16777216 + d[5] * 4294967296;
}

const DebugScreen = () => {
  const memory = useSelector(state => state.memory);
  const mem = useMemo(() => {
    console.log(memory?.bytes.length);
    if (!memory?.bytes || memory.bytes.length !== 168) {
      return null;
    }

    return new MemDesign(memory.bytes);
  }, [memory]);

  if (!mem) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Memory data is not available or size is not 169 bytes.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Memory Debug</Text>

      {/* ==================== ZONES ==================== */}

      <Section title="Zons [9]">
        {mem.Zons.map((zone, index) => (
          <Card key={index} title={`Zone ${index}`}>
            <Row label="Fire_mode" value={zone.Work_zone.Fire_mode} />

            <Row label="_24h_mode" value={zone.Work_zone._24h_mode} />

            <Row label="Normal_mode" value={zone.Work_zone.Normal_mode} />

            <Row label="State_pin_read" value={zone.Work_zone.State_pin_read} />

            <Row label="Ding_dong" value={zone.Outputs_zone.Ding_dong} />

            <Row label="Sms" value={zone.Outputs_zone.Sms} />

            <Row label="G_tell" value={zone.Outputs_zone.G_tell} />

            <Row label="Siren" value={zone.Outputs_zone.Siren} />

            <Row label="Speaker" value={zone.Outputs_zone.Speaker} />
          </Card>
        ))}
      </Section>

      {/* ==================== PHONE NUMBERS ==================== */}

      <Section title="Phone Numbers [5]">
        {mem.Phone_numbers.map((phone, index) => (
          <Card key={index} title={`Phone ${index}`}>
            <Row label="Number" value={getPhoneNumberAsNumber(phone.data)} />
            <Row label="Raw Data" value={bytesToHex(phone.data)} />

            <Row
              label="ambient_listening"
              value={phone.Number_settings.ambient_listening}
            />

            <Row label="admin" value={phone.Number_settings.admin} />

            <Row label="report" value={phone.Number_settings.report} />

            <Row label="guard" value={phone.Number_settings.guard} />

            <Row label="reserved" value={phone.Number_settings.reserved} />
          </Card>
        ))}
      </Section>

      {/* ==================== SYSTEM SETTINGS ==================== */}

      <Section title="System Settings">
        <Card>
          <Row
            label="Data"
            value={`0x${mem.System_settings.Data.toString(16)
              .padStart(6, '0')
              .toUpperCase()}`}
          />

          <Row
            label="period_time"
            value={mem.System_settings.S_Settings.period_time}
          />

          <Row
            label="notification_state"
            value={mem.System_settings.S_Settings.notification_state}
          />

          <Row label="mode" value={mem.System_settings.S_Settings.mode} />

          <Row
            label="doubl_security_state"
            value={mem.System_settings.S_Settings.doubl_security_state}
          />

          <Row
            label="doubl_security_min"
            value={mem.System_settings.S_Settings.doubl_security_min}
          />

          <Row
            label="sms_lang"
            value={mem.System_settings.S_Settings.sms_lang}
          />

          <Row
            label="relay_state"
            value={mem.System_settings.S_Settings.relay_state}
          />
        </Card>
      </Section>

      {/* ==================== PASSWORDS ==================== */}

      <Section title="Passwords">
        <Card>
          <Row label="menu_pass" value={mem.Passwords.menu_pass} />

          <Row label="tell_pass" value={mem.Passwords.tell_pass} />
        </Card>
      </Section>

      {/* ==================== DEVICE STATE ==================== */}

      <Section title="Device State">
        <Card>
          <Row label="device_state" value={mem.device_state} />
        </Card>
      </Section>

      {/* ==================== RF REMOTES ==================== */}

      <Section title="RF Remotes [10]">
        {mem.Rf_mem.map((remote, index) => (
          <Card key={index} title={`RF Remote ${index}`}>
            <Row
              label="Data"
              value={`0x${remote.Data.toString(16)
                .padStart(8, '0')
                .toUpperCase()}`}
            />

            <Row label="address_code" value={remote.Remote_.address_code} />

            <Row label="key" value={remote.Remote_.key} />

            <Row label="setings" value={remote.Remote_.setings} />
          </Card>
        ))}
      </Section>

      {/* ==================== RF ZONES ==================== */}

      <Section title="RF Zones [5]">
        {mem.rf_zone.map((zone, index) => (
          <Card key={index} title={`RF Zone ${index}`}>
            <Row
              label="Data"
              value={`0x${zone.Data.toString(16)
                .padStart(8, '0')
                .toUpperCase()}`}
            />
          </Card>
        ))}
      </Section>

      {/* ==================== TIMERS ==================== */}

      <Section title="Timers [7]">
        {mem.timers.map((timer, index) => (
          <Card key={index} title={`Timer ${index}`}>
            <Row label="relay_num" value={timer.relay_num} />

            <Row label="timer" value={timer.timer} />

            <Row label="state_" value={timer.state_} />

            <Row label="hours" value={timer.hours} />

            <Row label="min" value={timer.min} />

            <Row label="weekday" value={timer.weekday} />
          </Card>
        ))}
      </Section>

      {/* ==================== DEBT ==================== */}

      <Section title="Debt Status">
        <Card>
          <Row label="Debt_status" value={mem.Debt_status} />
        </Card>
      </Section>

      {/* ==================== RELAY ==================== */}

      <Section title="Relay Settings">
        <Card>
          <Row label="relay_mode" value={mem.relay_setting.relay_mode} />

          <Row label="relay_state" value={mem.relay_setting.relay_state} />

          <Row label="relay_time" value={mem.relay_setting.relay_time} />
        </Card>
      </Section>

      {/* ==================== CURRENT TIME ==================== */}

      <Section title="Current Time">
        <Card>
          <Row label="Hours" value={mem.current_time.Hours} />

          <Row label="Minutes" value={mem.current_time.Minutes} />

          <Row label="Seconds" value={mem.current_time.Seconds} />
        </Card>
      </Section>

      {/* ==================== CURRENT DATE ==================== */}

      <Section title="Current Date">
        <Card>
          <Row label="Year" value={mem.current_date.Year} />

          <Row label="Month" value={mem.current_date.Month} />

          <Row label="Date" value={mem.current_date.Date} />
        </Card>
      </Section>

      {/* ==================== CHECKSUM ==================== */}

      <Section title="Checksum">
        <Card>
          <Row
            label="chek_sum_cal"
            value={`0x${mem.chek_sum_cal
              .toString(16)
              .padStart(2, '0')
              .toUpperCase()}`}
          />
        </Card>
      </Section>
    </ScrollView>
  );
};

/* ========================================================= */
/* Components                                                */
/* ========================================================= */

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Card = ({ title, children }) => (
  <View style={styles.card}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}

    {children}
  </View>
);

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>

    <Text style={styles.value}>{String(value)}</Text>
  </View>
);

/* ========================================================= */
/* Styles                                                    */
/* ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },

  card: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
});

export default DebugScreen;
