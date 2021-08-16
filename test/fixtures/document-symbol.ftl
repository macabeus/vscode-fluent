-term = hey

## Section One

basic = foo
message-interpolation = the { basic } interpolation

## Section Two

term-interpolation =
  hey, it's the
  { -term } interpolation
variable-interpolation = the { $var } interpolation
selector = let's { $foo ->
   [0] foo
  *[1] bar
}
selector-interpolation = hey { selector }
