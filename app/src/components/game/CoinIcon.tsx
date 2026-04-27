import { gameAssets } from '../../lib/gameAssets'
import GameImage from './GameImage'

interface CoinIconProps {
  variant?: 'coin' | 'pile' | 'diamond'
  className?: string
  alt?: string
}

const map = {
  coin: gameAssets.currency.coin,
  pile: gameAssets.currency.coinPile,
  diamond: gameAssets.currency.diamondCluster,
}

export default function CoinIcon({ variant = 'coin', className = '', alt = '' }: CoinIconProps) {
  return <GameImage src={map[variant]} alt={alt} decorative={alt === ''} className={className} />
}
