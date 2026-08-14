import { cn, getAvatarGradient, getInitials } from '@/lib/utils'

interface Props {
  name: string
  photoUrl?: string | null
  seed?: string
  className?: string
  initialsClassName?: string
  alt?: string
}

const baseAvatarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
} as const

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const

export default function AvatarBadge({
  name,
  photoUrl,
  seed,
  className,
  initialsClassName,
  alt,
}: Props) {
  return (
    <div
      className={className}
      style={
        photoUrl
          ? baseAvatarStyle
          : {
              ...baseAvatarStyle,
              backgroundColor: '#141418',
              backgroundImage: getAvatarGradient(seed ?? name),
              backgroundSize: '160% 160%',
            }
      }
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={alt ?? name} style={imageStyle} />
      ) : (
        <span className={cn(initialsClassName)}>{getInitials(name)}</span>
      )}
    </div>
  )
}
