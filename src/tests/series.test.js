import Immutable  from 'immutable'
import { Series } from '../core/Series'
import { Index }  from '../core/Indices'

let srs = new Series(Immutable.Range(0, 50).toList(), {name:'numbers'})

test('Series should have 50 values', () => {
    expect(srs.length).toBe(50)
})

test('Series index should be instance of index', () => {
    expect(srs.index instanceof Index).toBe(true)
})

test('Series min and max should be 0 and 49', () => {
    expect(srs.min()).toBe(0)
    expect(srs.max()).toBe(49)
})

test('Series loc', () => {
    expect(srs.loc(0)).toBe(0)
    expect(srs.loc(-1)).toBe(49)
})

