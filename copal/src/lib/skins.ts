import { COLORS } from '../constants/theme';
import { SkinId, Skin } from '../types/deposit';

export const SKINS: Record<SkinId, Skin> = {
  void: {
    id: 'void',
    name: 'La Nada',
    priceMXN: 0,
    description: 'Negro total · punto rojo · silencio',
    owned: true,
  },
  dust: {
    id: 'dust',
    name: 'Polvo',
    priceMXN: 49,
    description: 'Letras que se pulverizan',
    owned: false,
  },
  drain: {
    id: 'drain',
    name: 'Drenarse',
    priceMXN: 49,
    description: 'Texto que cae como líquido',
    owned: false,
  },
  burn: {
    id: 'burn',
    name: 'Quemarse',
    priceMXN: 69,
    description: 'Se consume de abajo hacia arriba',
    owned: false,
  },
  static: {
    id: 'static',
    name: 'Estática',
    priceMXN: 69,
    description: 'Glitch de TV rota',
    owned: false,
  },
  float: {
    id: 'float',
    name: 'Soltarse',
    priceMXN: 89,
    description: 'Flota hacia arriba y desaparece',
    owned: false,
  },
  erase: {
    id: 'erase',
    name: 'Borrarse',
    priceMXN: 89,
    description: 'Se borra letra por letra, de atrás pa\' adelante',
    owned: false,
  },
  collapse: {
    id: 'collapse',
    name: 'Colapsar',
    priceMXN: 99,
    description: 'Colapsa al centro · flash blanco · nada',
    owned: false,
  },
};

export function getSkinPrice(skinId: SkinId): number {
  return SKINS[skinId].priceMXN;
}

export function isFree(skinId: SkinId): boolean {
  return SKINS[skinId].priceMXN === 0;
}
