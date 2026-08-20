import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

import MemoryDesign from '../memory/MemoryDesign';

const DebugScreen = () => {
  const memory = useSelector(state => state.memory);

  const mem = useMemo(() => {
    if (!memory?.bytes || memory.bytes.length !== 169) {
      return null;
    }
    const mem = new MemoryDesign(memory.bytes);
    // mem.currentTime.hours = 12;
    // mem.currentTime.minutes = 30;
    // mem.currentTime.seconds = 0;
    // mem.currentDate.date = 13;
    // mem.currentDate.month = 8;
    // mem.currentDate.year = 26;
    return mem;
  }, [memory]);

  if (!mem) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Memory is not available or size is not 169 bytes.
        </Text>

        <Text style={styles.info}>
          Received:{' '}
          {memory?.bytes?.length ?? 0} bytes
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* -------------------------------- */}
      {/* RAW MEMORY */}
      {/* -------------------------------- */}

      <Section title="RAW MEMORY">
        <Text style={styles.raw}>
          {bytesToHex(mem.bytes)}
        </Text>

        <Text style={styles.info}>
          Size: {mem.bytes.length} bytes
        </Text>
      </Section>

      {/* -------------------------------- */}
      {/* ZONES */}
      {/* -------------------------------- */}

      <Section title="ZONES">
        {mem.zones.map((zone, index) => (
          <Item
            key={index}
            title={`Zone ${index}`}
            values={[
              ['fireMode', zone.fireMode],
              ['h24Mode', zone.h24Mode],
              ['normalMode', zone.normalMode],
              ['statePinRead', zone.statePinRead],
              ['dingDong', zone.dingDong],
              ['sms', zone.sms],
              ['gTell', zone.gTell],
              ['siren', zone.siren],
              ['speaker', zone.speaker],
            ]}
          />
        ))}
      </Section>

      {/* -------------------------------- */}
      {/* PHONE NUMBERS */}
      {/* -------------------------------- */}

      <Section title="PHONE NUMBERS">
        {mem.phoneNumbers.map((phone, index) => (
          <Item
            key={index}
            title={`Phone ${index}`}
            values={[
              ['number', phone.number],
              ['ambient_listening', phone.ambient_listening],
              ['admin', phone.admin],
              ['report', phone.report],
              ['guard', phone.guard],
            ]}
          />
        ))}
      </Section>

      {/* -------------------------------- */}
      {/* SYSTEM SETTINGS */}
      {/* -------------------------------- */}

      <Section title="SYSTEM SETTINGS">
        <Item
          values={[
            ['raw', formatHex(mem.systemSettings.raw)],
            ['periodTime', mem.systemSettings.periodTime],
            [
              'notificationState',
              mem.systemSettings.notificationState,
            ],
            ['mode', mem.systemSettings.mode],
            [
              'doubleSecurityState',
              mem.systemSettings.doubleSecurityState,
            ],
            [
              'doubleSecurityMin',
              mem.systemSettings.doubleSecurityMin,
            ],
            ['smsLang', mem.systemSettings.smsLang],
            ['relayState', mem.systemSettings.relayState],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* PASSWORDS */}
      {/* -------------------------------- */}

      <Section title="PASSWORDS">
        <Item
          values={[
            ['menu', mem.passwords.menu],
            ['tell', mem.passwords.tell],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* DEVICE STATE */}
      {/* -------------------------------- */}

      <Section title="DEVICE STATE">
        <Item
          values={[
            ['deviceState', mem.deviceState],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* RF REMOTES */}
      {/* -------------------------------- */}

      <Section title="RF REMOTES">
        {mem.rfRemotes.map((remote, index) => (
          <Item
            key={index}
            title={`Remote ${index}`}
            values={[
              ['raw', formatHex(remote.raw, 8)],
              ['addressCode', remote.addressCode],
              ['key', remote.key],
              ['settings', remote.settings],
            ]}
          />
        ))}
      </Section>

      {/* -------------------------------- */}
      {/* RF ZONES */}
      {/* -------------------------------- */}

      <Section title="RF ZONES">
        {mem.rfZones.map((zone, index) => (
          <Item
            key={index}
            title={`RF Zone ${index}`}
            values={[
              ['raw', formatHex(zone.data, 8)],
            ]}
          />
        ))}
      </Section>

      {/* -------------------------------- */}
      {/* TIMERS */}
      {/* -------------------------------- */}

      <Section title="TIMERS">
        {mem.timers.map((timer, index) => (
          <Item
            key={index}
            title={`Timer ${index}`}
            values={[
              ['relayNum', timer.relayNum],
              ['timer', timer.timer],
              ['state', timer.state],
              ['hours', timer.hours],
              ['minutes', timer.minutes],
              ['weekday', timer.weekday],
            ]}
          />
        ))}
      </Section>

      {/* -------------------------------- */}
      {/* DEBT */}
      {/* -------------------------------- */}

      <Section title="DEBT STATUS">
        <Item
          values={[
            ['debtStatus', mem.debtStatus],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* RELAY SETTINGS */}
      {/* -------------------------------- */}

      <Section title="RELAY SETTINGS">
        <Item
          values={[
            ['relayMode', mem.relaySettings.relayMode],
            ['relayState', mem.relaySettings.relayState],
            ['relayTime', mem.relaySettings.relayTime],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* CURRENT TIME */}
      {/* -------------------------------- */}

      <Section title="CURRENT TIME">
        <Item
          values={[
            ['hours', mem.currentTime.hours],
            ['minutes', mem.currentTime.minutes],
            ['seconds', mem.currentTime.seconds],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* CURRENT DATE */}
      {/* -------------------------------- */}

      <Section title="CURRENT DATE">
        <Item
          values={[
            ['year', mem.currentDate.year],
            ['month', mem.currentDate.month],
            ['date', mem.currentDate.date],
          ]}
        />
      </Section>

      {/* -------------------------------- */}
      {/* CHECKSUM */}
      {/* -------------------------------- */}

      <Section title="CHECKSUM">
        <Item
          values={[
            ['checksum', formatHex(mem.checksum, 2)],
          ]}
        />
      </Section>
    </ScrollView>
  );
};

export default DebugScreen;

// =====================================================
// Section
// =====================================================

const Section = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {children}
    </View>
  );
};

// =====================================================
// Item
// =====================================================

const Item = ({ title, values = [] }) => {
  return (
    <View style={styles.item}>
      {title && (
        <Text style={styles.itemTitle}>
          {title}
        </Text>
      )}

      {values.map(([key, value]) => (
        <View
          key={key}
          style={styles.row}
        >
          <Text style={styles.key}>
            {key}
          </Text>

          <Text style={styles.value}>
            {formatValue(value)}
          </Text>
        </View>
      ))}
    </View>
  );
};

// =====================================================
// Helpers
// =====================================================

const formatValue = value => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  return String(value);
};

const formatHex = (value, length = 8) => {
  return `0x${(value >>> 0)
    .toString(16)
    .padStart(length, '0')
    .toUpperCase()}`;
};

const bytesToHex = bytes => {
  return Array.from(bytes)
    .map(byte =>
      byte.toString(16).padStart(2, '0').toUpperCase(),
    )
    .join(' ');
};

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },

  content: {
    padding: 12,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111',
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ff5555',
    marginBottom: 10,
  },

  info: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 6,
  },

  section: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#181818',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },

  item: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#222',
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },

  key: {
    fontSize: 13,
    color: '#aaa',
  },

  value: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },

  raw: {
    fontSize: 12,
    lineHeight: 20,
    color: '#fff',
    fontFamily: 'monospace',
  },
});