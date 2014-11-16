# Mathematical verbs

Mathematical verbs are all atomic.

~ (invert)
  ~number
  ~sequenceOfNumbers
  ~collectionOfNumbers
+ (add)
  number+number
  number+sequenceOfNumbers
  number+collectionOfNumbers
  number+channelOfNumbers
  sequenceOfNumbers+number
  sequenceOfNumbers+sequenceOfNumbers
  collectionOfNumbers+number
  collectionOfNumbers+collectionOfNumbers
  channelOfNumbers+number
  channelOfNumbers+channelOfNumbers
- (subtract)
  -number
  number-number
  number-sequenceOfNumbers
  number-collectionOfNumbers
  number-channelOfNumbers
  -sequenceOfNumbers
  sequenceOfNumbers-number
  sequenceOfNumbers-sequenceOfNumbers
  -collectionOfNumbers
  collectionOfNumbers-number
  collectionOfNumbers-collectionOfNumbers
  -channelOfNumbers
  channelOfNumbers-number
  channelOfNumbers-channelOfNumbers
* (multiply)
  number*number
  number*sequenceOfNumbers
  number*collectionOfNumbers
  number*channelOfNumbers
  sequenceOfNumbers*number
  sequenceOfNumbers*sequenceOfNumbers
  collectionOfNumbers*number
  collectionOfNumbers*collectionOfNumbers
  channelOfNumbers*number
  channelOfNumbers*channelOfNumbers
% (divide)
  %number (reciprocal)
  number%number
  number%sequenceOfNumbers
  number%collectionOfNumbers
  number%channelOfNumbers
  sequenceOfNumbers%number
  sequenceOfNumbers%sequenceOfNumbers
  collectionOfNumbers%number
  collectionOfNumbers%collectionOfNumbers
  channelOfNumbers%number
  channelOfNumbers%channelOfNumbers
! (residue)
  number!number (right by left)
^ (power)
  number^number
  number^sequenceOfNumbers
  number^collectionOfNumbers
  number^channelOfNumbers
  sequenceOfNumbers^number
  sequenceOfNumbers^sequenceOfNumbers
  collectionOfNumbers^number
  collectionOfNumbers^collectionOfNumbers
  channelOfNumbers^number
  channelOfNumbers^channelOfNumbers
& (min/and)
  number&number
  number&sequenceOfNumbers
  number&collectionOfNumbers
  number&channelOfNumbers
  sequenceOfNumbers&number
  sequenceOfNumbers&sequenceOfNumbers
  collectionOfNumbers&number
  collectionOfNumbers&collectionOfNumbers
  channelOfNumbers&number
  channelOfNumbers&channelOfNumbers
| (max/or)
  number|number
  number|sequenceOfNumbers
  number|collectionOfNumbers
  number|channelOfNumbers
  sequenceOfNumbers|number
  sequenceOfNumbers|sequenceOfNumbers
  collectionOfNumbers|number
  collectionOfNumbers|collectionOfNumbers
  channelOfNumbers|number
  channelOfNumbers|channelOfNumbers
< (less)
  number<number
  number<sequenceOfNumbers
  number<collectionOfNumbers
  number<channelOfNumbers
  sequenceOfNumbers<number
  sequenceOfNumbers<sequenceOfNumbers
  collectionOfNumbers<number
  collectionOfNumbers<collectionOfNumbers
  channelOfNumbers<number
  channelOfNumbers<channelOfNumbers
> (more)
  number>number
  number>sequenceOfNumbers
  number>collectionOfNumbers
  number>channelOfNumbers
  sequenceOfNumbers>number
  sequenceOfNumbers>sequenceOfNumbers
  collectionOfNumbers>number
  collectionOfNumbers>collectionOfNumbers
  channelOfNumbers>number
  channelOfNumbers>channelOfNumbers
= (equals)
  number=number
  number=sequenceOfNumbers
  number=collectionOfNumbers
  number=channelOfNumbers
  sequenceOfNumbers=number
  sequenceOfNumbers=sequenceOfNumbers
  collectionOfNumbers=number
  collectionOfNumbers=collectionOfNumbers
  channelOfNumbers=number
  channelOfNumbers=channelOfNumbers
_ (floor)
  _number
  _sequenceOfNumbers
  _collectionOfNumbers
  _channelOfNumbers

# Non-mathematical verbs

~
  sequence~sequence -> left matches right
  collection~collection -> keys and values of left match right
!
  !number -> enumerate
  symbol!any -> function that assocs value right at key left in its argument
  collection!(key;value) -> assoc value at key in left
  any!channel -> put left on right
  channel!any -> put right on left
@
  @any -> is an atom
  symbol@collection -> function that returns value in right at key left
  function@any -> call left with single value right
  node@(key;value) -> set key attribute of left to value
  object@(key;value) -> invoke key method on left with value
#
  #sequence -> length
  number#sequence -> take left items from right, from start if left is positive, from end if left is negative
  sequenceOfIntegers#sequence -> reshape right according to left
  #collection -> number of key/value pairs
  #channel -> whether channel is open or closed
$
  $number -> as string
  string$number -> format right according to left
  $sequence -> as JSON
  string$sequence -> format items in right according to left
  symbol$sequence -> selection with tag name left over data right
  $collection -> as JSON
  string$collection -> format right according to left
&
  &sequence -> where
  sequence&sequence -> smaller of items in left to corresponding items in right
*
  *sequence -> first
  *channel -> take
,
  atom,sequence -> prepend left to right
  (key;value),collection -> assoc value at key in right
  sequence,atom -> append right to left
  sequence,sequence -> concatenate right to left
  collection,collection -> merge right into left
  collection,(key;value) -> assoc value at key in left
.
  function.function -> compose
  function.sequence -> apply
<
  <sequence -> gradeUp
  <collection -> keys
>
  >sequence -> gradeDown
  >collection -> values
?
  ?sequence -> distinct items
  number?number -> pick left items from enumeration of right, without replacement if left is negative
  number?sequence -> pick left items from right, without replacement if left is negative
=
  character=character -> equals
  symbol=symbol -> equals
  =sequence -> group
+
  +sequenceOfSequences -> transpose
|
  |sequence -> reverse
:
  word:any -> assign value of right to name left
  symbol:any -> function that invokes left method on argument with right
C -> new channel
D
  Dsequence -> create dictionary from pairs in right
N -> nil
L
  Lfunction -> lazy sequence generated by repeatedly calling right
