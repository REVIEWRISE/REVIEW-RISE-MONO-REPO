import Image, { type ImageProps } from 'next/image'

const Logo = (props: Omit<ImageProps, 'src' | 'alt'>) => {
  return (
    <Image
      src='/logo.png'
      alt='Logo'
      width={50}
      height={40}
      priority
      {...props}
    />
  )
}

export default Logo
