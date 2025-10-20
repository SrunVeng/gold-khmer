export const TROY_OUNCE_GRAMS = 31.1034768
export const DEFAULT_DOMLENG_GRAMS = 37.5 // Common Cambodia "tael" standard

export const domlengFactorFromOz = (domlengG = DEFAULT_DOMLENG_GRAMS) =>
    domlengG / TROY_OUNCE_GRAMS

export const chiFactorFromOz = (domlengG = DEFAULT_DOMLENG_GRAMS) =>
    (domlengG / 10) / TROY_OUNCE_GRAMS

export const pricePerDomleng = (pricePerOz) =>
    pricePerOz * domlengFactorFromOz()

export const pricePerChi = (pricePerOz) =>
    pricePerOz * chiFactorFromOz()
