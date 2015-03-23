{ Pred, If, compile } = require 'matchbox/index'
{ assert } = require 'chai'

describe "pattern helpers", ->
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
    it "invokes the pattern for each object"
    it "works on iterables"

  describe "And", ->
    it "short-circuits"

  describe "Or", ->
    it "short-circuits"

  describe "Any", ->
    it "always passes"
    it "passes even when invoked with no arguments"
