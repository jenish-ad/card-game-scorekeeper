import { t } from '../i18n';
import { useState } from 'react';
import {
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../useTheme';
import { Icon } from './Icon';
import { Button } from './Primitives';
import { useStyles } from './Screen';
export function ScoreboardActions({
  finished,
  canUndo,
  busy,
  share,
  changeStatus,
  undo,
  players,
}: {
  finished: boolean;
  canUndo: boolean;
  busy: boolean;
  share: () => void;
  changeStatus: () => void;
  undo: () => void;
  players: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const statusLabel = finished ? t('Reopen match') : t('Finish match');
  function showMenu() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            statusLabel,
            t('Undo last round'),
            t('Players'),
            t('Cancel'),
          ],
          cancelButtonIndex: 3,
          destructiveButtonIndex: canUndo ? 1 : undefined,
          disabledButtonIndices: canUndo ? [] : [1],
        },
        (index) => {
          if (index === 0) changeStatus();
          else if (index === 1 && canUndo) undo();
          else if (index === 2) players();
        },
      );
    } else setOpen(true);
  }
  function choose(action: () => void) {
    setOpen(false);
    action();
  }
  return (
    <View style={local.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Share result')}
        disabled={busy}
        onPress={share}
        style={local.icon}
      >
        <Icon name="share-outline" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Match actions')}
        disabled={busy}
        onPress={showMenu}
        style={local.icon}
      >
        <Icon name="ellipsis-horizontal" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessible={false}
          style={local.backdrop}
          onPress={() => setOpen(false)}
        >
          <Pressable
            accessible={false}
            accessibilityViewIsModal
            style={[
              local.menu,
              {
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.xl,
              },
            ]}
            onPress={() => {}}
          >
            <Text style={styles.subtitle}>{t('Match actions')}</Text>
            <Button
              secondary
              label={statusLabel}
              onPress={() => choose(changeStatus)}
            />
            <Button
              secondary
              destructive
              label={t('Undo last round')}
              disabled={!canUndo}
              onPress={() => choose(undo)}
            />
            <Button
              secondary
              label={t('Players')}
              onPress={() => choose(players)}
            />
            <Button
              secondary
              label={t('Cancel')}
              onPress={() => setOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
const local = StyleSheet.create({
  actions: { flexDirection: 'row' },
  icon: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000066',
  },
  menu: { width: '85%', maxWidth: 340, borderRadius: 12, gap: 12 },
});
