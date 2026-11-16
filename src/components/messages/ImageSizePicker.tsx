import { useTranslate } from '../../i18n/index.js'
import { Select, type SelectOption } from '../base/Select.js'
import styles from './AssistantMessage.module.css'

const PRESETS = [
  'match',
  'auto',
  '1024x1024',
  '1024x1536',
  '1536x1024',
  '1024x1792',
  '1792x1024',
] as const
const CUSTOM_VALUE = '__custom__'

/** 图片尺寸选择与自定义输入（共用组件：输入框生图条 + 生图确认卡片） */
export const ImageSizePicker = ({
  value,
  hasReference,
  compact = false,
  onChange,
}: {
  value: string
  hasReference: boolean
  compact?: boolean
  onChange: (next: string) => void
}) => {
  const t = useTranslate()
  const normalized = value.trim() || (hasReference ? 'match' : 'auto')
  const isPreset = PRESETS.includes(normalized as (typeof PRESETS)[number])

  const options: SelectOption<string>[] = [
    ...(hasReference ? [{ value: 'match', label: t('imageGenSizeMatch') }] : []),
    { value: 'auto', label: t('imageGenSizeAuto') },
    { value: '1024x1024', label: '1:1 (1024×1024)' },
    { value: '1024x1536', label: '2:3 (1024×1536)' },
    { value: '1536x1024', label: '3:2 (1536×1024)' },
    { value: '1024x1792', label: '9:16 (1024×1792)' },
    { value: '1792x1024', label: '16:9 (1792×1024)' },
    { value: CUSTOM_VALUE, label: t('imageGenSizeCustom') },
  ]

  return (
    <div className={compact ? styles.sizePickerCompact : styles.sizePickerRow}>
      <Select
        value={isPreset ? normalized : CUSTOM_VALUE}
        options={options}
        ariaLabel={t('imageGenSizeLabel')}
        className={compact ? styles.sizeSelectCompact : undefined}
        onChange={(selected) => {
          if (selected === CUSTOM_VALUE) {
            if (isPreset) {
              onChange('1280x720')
            }
          } else {
            onChange(selected)
          }
        }}
      />
      {!isPreset ? (
        <input
          type="text"
          className={styles.sizeCustomInput}
          placeholder={t('imageGenSizePlaceholder')}
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  )
}
