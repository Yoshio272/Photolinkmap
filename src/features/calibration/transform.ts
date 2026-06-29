/**
 * キャリブレーション座標変換（2点アフィン変換）
 * 「キャリブレーションを使用する」がONの場合のみ利用される
 */
import type { CalibPoint, LatLng } from '../../types'

export function pxToLatLng(px: number, py: number, pts: CalibPoint[]): LatLng {
  const [a, b] = pts
  if (!a || !b || a.lat === undefined || b.lat === undefined) return { lat: 0, lng: 0 }
  const dpx = (b.px - a.px) || 1
  const dpy = (b.py - a.py) || 1
  const lat = a.lat! + (py - a.py) * ((b.lat! - a.lat!) / dpy)
  const lng = a.lng! + (px - a.px) * ((b.lng! - a.lng!) / dpx)
  return { lat, lng }
}

export function latLngToPx(lat: number, lng: number, pts: CalibPoint[]): { x: number; y: number } | null {
  const [a, b] = pts
  if (!a || !b || a.lat === undefined || b.lat === undefined) return null
  const dlat = (b.lat! - a.lat!) || 1e-9
  const dlng = (b.lng! - a.lng!) || 1e-9
  const y = a.py + (lat - a.lat!) * ((b.py - a.py) / dlat)
  const x = a.px + (lng - a.lng!) * ((b.px - a.px) / dlng)
  return { x, y }
}

/** 緯度経度文字列のパース（"35.1234, 135.5678" / Google Maps URL 対応）*/
export function parseLatLng(input: string): LatLng | null {
  const s = input.trim()
  // Google Maps URL: @35.1234,135.5678 or ?q=35.1,135.5
  const urlMatch = s.match(/[@?q=]?(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/)
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1]), lng = parseFloat(urlMatch[2])
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
  }
  return null
}
