-term = hey

basic = foo
message-interpolation = the { basic } interpolation
term-interpolation = the { -term } interpolation
variable-interpolation = the { $var } interpolation
selector = let's { $foo ->
   [0] foo
  *[1] bar
}
selector-interpolation = hey { selector }
