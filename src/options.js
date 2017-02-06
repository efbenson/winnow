const transformEnvelope = require('./geometry/transform-envelope')
const esriPredicates = {
  esriSpatialRelContains: 'ST_Contains',
  esriSpatialRelWithin: 'ST_Within',
  esriSpatialRelIntersects: 'ST_Intersects'
}

function prepare (options) {
  return {
    where: options.where,
    geometry: normalizeGeometry(options),
    spatialPredicate: normalizeSpatialPredicate(options),
    fields: normalizeFields(options),
    order: normalizeOrder(options),
    aggregates: normalizeAggregates(options),
    groupBy: normalizeGroupBy(options),
    limit: normalizeLimit(options),
    offset: normalizeOffset(options),
    esri: options.esri,
    toEsri: options.toEsri,
    collection: options.collection
  }
}

function normalizeSpatialPredicate (options) {
  const predicate = options.spatialPredicate || options.spatialRel

  return esriPredicates[predicate] || predicate
}

function normalizeFields (options) {
  const fields = options.fields || options.outFields
  return typeof fields === 'string' ? [fields] : fields
}

function normalizeOrder (options) {
  const order = options.order || options.orderByFields
  return typeof order === 'string' ? [order] : order
}

function normalizeAggregates (options) {
  let aggregates = options.aggregates
  if (options.outStatistics) {
    aggregates = options.outStatistics.map((agg) => {
      return {
        type: agg.statisticType,
        field: agg.onStatisticField,
        name: agg.outStatisticFieldName
      }
    })
  }

  if (aggregates) {
    aggregates.forEach(agg => {
      if (!agg.name) agg.name = `${agg.type}_${agg.field}`
      agg.name = agg.name.replace(/\s/g, '_')
    })
  }

  return aggregates
}

function normalizeGroupBy (options) {
  const groupBy = options.groupBy || options.groupByFieldsForStatistics
  return typeof groupBy === 'string' ? [groupBy] : groupBy
}

function normalizeGeometry (options) {
  if (!options.geometry) return
  const geom = options.geometry
  const geometry = (geom.xmin && geom.ymax) ? transformEnvelope(geom) : geom
  return geometry
}

function normalizeLimit (options) {
  return options.limit || options.resultRecordCount
}

function normalizeOffset (options) {
  return options.offset || options.resultOffset
}

module.exports = { prepare }