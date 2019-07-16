import Immutable             from 'immutable'
import { Axis } from '../core/Axes'

//create a new index
let idx = new Axis(Immutable.Range(0, 100).toList(), {name:"first index"})

test('index length should be 100', () => {
    expect(idx.length).toBe(100);
});

test('index name should be ', () => {
    expect(idx.name).toBe("first index");
});

test('filtering index', () => {
    expect(idx.filter((value) => {
        return value % 10 != 0
    }).length).toBe(90);
})

test('map to constant', () => {
    expect(idx.map((value) => 2).length).toBe(100)
})

test('mask divisibles by 7', () => {
    expect(idx.mask(idx.map(value => value % 7 == 0)).max()).toBe(98)
})

test('min should be 0', () => {
    expect(idx.min()).toBe(0)
})

test('max should be 99', () => {
    expect(idx.max()).toBe(99)
})

test('idxmax should be 99', () => {
    expect(idx.idxmax()).toBe(99)
})

test('idxmax should be 0 in reversed index', () => {
    expect(idx.reverse().idxmax()).toBe(0)
})

test('renaming index', () => {
    expect(idx.rename('new name').name).toBe('new name')
})

let idx2 = new Axis([1,2,2,3,4,5,5,1], {name:'index 2'})

test('find duplicates, flagging all but the first occurence', () => {
    expect(idx2.duplicates('first').iloc(0)).toBe(false)
    expect(idx2.duplicates('first').iloc(1)).toBe(false)
    expect(idx2.duplicates('first').iloc(2)).toBe(true)
    expect(idx2.duplicates('first').iloc(3)).toBe(false)
    expect(idx2.duplicates('first').iloc(-3)).toBe(false)
    expect(idx2.duplicates('first').iloc(-2)).toBe(true)
    expect(idx2.duplicates('first').iloc(-1)).toBe(true)
})

test('find duplicates, flagging all but the last occurence', () => {
    expect(idx2.duplicates('last').iloc(0)).toBe(true)
    expect(idx2.duplicates('last').iloc(1)).toBe(true)
    expect(idx2.duplicates('last').iloc(2)).toBe(false)
    expect(idx2.duplicates('last').iloc(3)).toBe(false)
    expect(idx2.duplicates('last').iloc(-3)).toBe(true)
    expect(idx2.duplicates('last').iloc(-2)).toBe(false)
    expect(idx2.duplicates('last').iloc(-1)).toBe(false)
})

test('find duplicates, flagging all occurences', () => {
    expect(idx2.duplicates().iloc(0)).toBe(true)
    expect(idx2.duplicates().iloc(1)).toBe(true)
    expect(idx2.duplicates().iloc(2)).toBe(true)
    expect(idx2.duplicates().iloc(3)).toBe(false)
    expect(idx2.duplicates().iloc(-3)).toBe(true)
    expect(idx2.duplicates().iloc(-2)).toBe(true)
    expect(idx2.duplicates().iloc(-1)).toBe(true)
})

test('test any and all', () => {
    expect(idx2.duplicates().any()).toBe(true)
    expect(idx2.duplicates().all()).toBe(false)
})

let idx3 = new Axis([1,2,3,4,5,6,7,8,9,10], {name:"numbers"})
let idx4 = new Axis([2,4,6,8,10], {name:"evens"})
let idx5 = new Axis([1,3,5,7,9], {name:"odds"})

test('test union/intersection/difference', () => {
    expect(idx4.duplicates().any()).toBe(false)
    expect(idx4.union(idx5).length).toBe(10)
    expect(idx4.intersection(idx5).length).toBe(0)
    expect(idx3.difference(idx5).length).toBe(5)
})





