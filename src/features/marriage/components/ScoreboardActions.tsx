import { t } from '@/i18n';
import { useState, type ReactNode } from 'react';
import {
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { Button } from '@/ui/Button';
import { useStyles } from '@/ui/Screen';
export function ScoreboardActions({
  finished,
  canUndo,
  busy,
  share,
  changeStatus,
  undo,
  players,
  recordFoul,
  removeMatch,
  renderTrigger,
  title,
}: {
  finished: boolean;
  canUndo: boolean;
  busy: boolean;
  share: () => void;
  changeStatus: () => void;
  undo: () => void;
  players: () => void;
  recordFoul: () => void;
  removeMatch: () => void;
  renderTrigger?: (showMenu: () => void) => ReactNode;
  title?: string;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const statusLabel = finished ? t('Reopen match') : t('Finish match');
  function showMenu() {
    if (busy) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            statusLabel,
            t('Undo last round'),
            t('Record foul'),
            t('Players'),
            t('Delete match'),
            t('Share result'),
            t('Cancel'),
          ],
          cancelButtonIndex: 6,
          destructiveButtonIndex: canUndo ? [1, 4] : 4,
          disabledButtonIndices: [
            ...(canUndo ? [] : [1]),
            ...(finished ? [2] : []),
          ],
        },
        (index) => {
          if (index === 0) changeStatus();
          else if (index === 1 && canUndo) undo();
          else if (index === 2 && !finished) recordFoul();
          else if (index === 3) players();
          else if (index === 4) removeMatch();
          else if (index === 5) share();
        },
      );
    } else setOpen(true);
  }
  function choose(action: () => void) {
    setOpen(false);
    action();
  }
  return (
    <>
      {renderTrigger ? (
        renderTrigger(showMenu)
      ) : (
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
        </View>
      )}
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
              styles.card,
              theme.shadows.raised,
              local.menu,
              {
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.xl,
              },
            ]}
            onPress={() => {}}
          >
            <Text style={styles.subtitle}>{t('Match actions')}</Text>
            {title && <Text style={styles.label}>{title}</Text>}
            {renderTrigger && (
              <Button
                secondary
                label={t('Share result')}
                onPress={() => choose(share)}
              />
            )}
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
              icon="warning-outline"
              label={t('Record foul')}
              disabled={finished}
              onPress={() => choose(recordFoul)}
            />
            <Button
              secondary
              label={t('Players')}
              onPress={() => choose(players)}
            />
            <Button
              destructive
              label={t('Delete match')}
              onPress={() => choose(removeMatch)}
            />
            <Button
              secondary
              label={t('Cancel')}
              onPress={() => setOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  menu: { width: '85%', maxWidth: 340, borderRadius: 18, gap: 12 },
});
