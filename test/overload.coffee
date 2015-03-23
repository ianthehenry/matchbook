{ If, overload } = require 'matchbox/index'
{ assert } = require 'chai'

describe "overload", ->
  it "uses the first match, not the best match", ->
    fn = overload (match) ->
      match ->
      match [Number], (x) -> throw new Error("nooo")
    assert.doesNotThrow -> fn(10)

  it "picks the first match even if subsequent matches are the same", ->
    fn = overload (match) ->
      match ->
      match -> throw new Error("nooo")
    assert.doesNotThrow -> fn(10)

  it "passes an array to the underlying predicate", ->
    foo = false
    fn = overload (match) ->
      match If((args) -> foo = Array.isArray(args)), ->
    fn(1, 2, 3)
    assert foo

  it "preserves context", ->
    obj = {foo: 10}
    fn = overload (match) ->
      match -> @foo
    assert fn.call(obj, 1, 2, 3) == 10

  it "treats no arguments as a match-all", ->
    fn = overload (match) ->
      match [], -> 'none'
      match [Number], -> 'num'
      match [String], -> 'str'
      match -> 'other'
    assert.equal(fn(10), 'num')
    assert.equal(fn('foo'), 'str')
    assert.equal(fn(), 'none')
    assert.equal(fn(10, 20), 'other')

  it "allows no patterns to be configured", ->
    fn = overload (match) ->
    assert.throws -> fn()

  it "requires at least one argument to match", ->
    assert.throws -> overload (match) -> match()

  it "requires the implementation to be a function", ->
    assert.throws -> overload (match) -> match(10)
    assert.throws -> overload (match) -> match(10, 20)
    assert.throws -> overload (match) -> match(10, 20, ->)

  it "cannot be invoked without a setup function", ->
    assert.throws -> overload()
    assert.throws -> overload(10)
    assert.throws -> overload(10, ->)

  it "doesn't allow adding matches outside the life of the setup invocation", ->
    steal = null
    overload (match) ->
      steal = match
    assert.throws -> save[0]()
