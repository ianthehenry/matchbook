{ compile, If, Any, Or, And, List } = require 'matchbook/index'
take = require './lib/take'
repeat = require './lib/repeat'
ParentES6 = require './lib/parent'
ChildES6 = require './lib/child'
{ assert } = require 'chai'

class Parent
class Child extends Parent

describe "patterns", ->
  describe "classes", ->
    it "works on CoffeeScript classes", ->
      parent = new Parent()
      child = new Child()
      assert compile(Parent)(parent)
      assert compile(Parent)(child)
      assert !compile(Child)(parent)
      assert compile(Child)(child)

    it "works on Babel classes", ->
      parent = new ParentES6()
      child = new ChildES6()
      assert compile(ParentES6)(parent)
      assert compile(ParentES6)(child)
      assert !compile(ChildES6)(parent)
      assert compile(ChildES6)(child)

  it "matches literal values", ->
    assert compile(10)(10)
    assert !compile(10)(20)
    assert compile('foo')('foo')
    assert !compile('foo')('bar')
    assert compile(true)(true)
    assert !compile(true)(false)
    assert compile(undefined)(undefined)
    assert compile(undefined)()
    assert !compile(undefined)(null)
    assert compile(null)(null)
    assert !compile(null)(undefined)
    assert !compile(null)()

  describe "arrays", ->
    it "match deeply", ->
      parent = new Parent()
      child = new Child()
      assert compile([10])([10])
      assert !compile([10])([10, 20])
      assert !compile([10])([20])
      assert compile([10, 20])([10, 20])
      assert compile([Parent, Child])([child, child])
      assert !compile([Parent, Child])([parent, parent])

  describe "objects", ->
    it "match deeply", ->
      assert compile({foo: Number})({foo: 10})
      assert !compile({foo: Number})({foo: '10'})
      assert !compile({foo: Number})({bar: 10})
      assert compile({foo: {bar: Number}})({foo: {bar: 10}})
      assert !compile({foo: {bar: Number}})({foo: {bar: '10'}})

    it "specifies minimum keys", ->
      assert compile({foo: Number})({foo: 10, bar: 20})

    it "requires keys to be present, even with Any", ->
      assert compile({foo: Any})({foo: undefined})
      assert !compile({foo: Any})({bar: 20})

    it "requires a typeof object", ->
      assert !compile({toString: Function})(true)
      assert !compile({toString: Function})(1)
      assert compile({toString: Function})({})

  describe "If", ->
    it "invokes the function to determine a match", ->
      isPositive = compile(If (x) -> x > 0)
      assert isPositive(10)
      assert !isPositive(0)

    it "produces an immutable value", ->
      "use strict"
      isPositivePattern = If (x) -> x > 0
      assert.throws -> isPositive.matches = (x) -> x < 10
      assert.throws -> isPositive.foo = 10

  describe "List", ->
    it "invokes the pattern for each object", ->
      assert compile(List(Number))([1, 2, 3])
      assert !compile(List(Number))([1, 2, 3, 'foo'])
      assert !compile(List([Number]))([[1], [2], [3], [4, 5]])

    it "works on generators", ->
      assert compile(List(Number))(take(5, repeat(10)))

    it "short-circuits", ->
      assert !compile(List(Number))(repeat('foo'))

  describe "And", ->
    it "short-circuits", ->
      fn = compile(And(Number, If(-> throw new Error("nooo"))))
      assert.throws -> fn(10)
      assert.doesNotThrow -> fn('foo')
      assert !fn('foo')

  describe "Or", ->
    it "short-circuits", ->
      fn = compile(Or(Number, If(-> throw new Error("nooo"))))
      assert.throws -> fn('foo')
      assert.doesNotThrow -> fn(10)
      assert fn(10)

  describe "Any", ->
    it "always passes", ->
      assert compile(Any)(10)
      assert compile(Any)('foo')
      assert compile(Any)('bar')

    it "passes even when invoked with no arguments", ->
      assert compile(Any)()
