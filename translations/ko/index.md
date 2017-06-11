@title
  @primary
    Promises
  @secondary
    by Forbes Lindesay

##[motivation] 사용하는 이유

하나의 파일을 읽고, JSON으로 또 이걸 파싱하는 동기 함수를 떠올려보죠. 간단하고 읽기 쉽긴 하지만, 이건 실제 블록킹 동작을 일으키기 때문에 대부분의 프로그램에서 이런 방식으로 사용하고 싶진 않을거에요. 여기서 블록킹이란 말은 디스크에서 파일을 읽는 중에는 다른 작업을 전혀 할 수 없는 것을 말해요.

:js
  function readJSONSync(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  }

우리는 프로그램의 성능과 반응 향상을 위해 입・출력과 관련된 모든 작업을 비동기로 만들어야 해요. 가장 간단한 방법은 콜백을 사용하는 것이지만, 미숙한 경험을 가지고 만든 이 함수는 문제가 발생하겠네요.

:js
  function readJSON(filename, callback){
    fs.readFile(filename, 'utf8', function (err, res){
      if (err) return callback(err);
      callback(null, JSON.parse(res));
    });
  }

- 추가된 파라미터인 `callback`은 무엇이 입력이고 반환값인지 헷갈리게 만들어요.
- 이 흐름제어만으로는 제대된 동작은 어려워요.
- 또 `JSON.parse`에서 발생하는 에러를 처리하지도 못해요.

먼저 `JSON.parse`함수가 호출될 때 발생 될 수 있는 에러에 대해서 처리해보죠. 그렇지만 `callback`함수에서 발생 될 수 있는 에러에 대해서는 처리않아 볼게요. 이런.. 다하니까, 에러 처리땜에 좀 복잡해졌네요.

:js
  function readJSON(filename, callback){
    fs.readFile(filename, 'utf8', function (err, res){
      if (err) return callback(err);
      try {
        res = JSON.parse(res);
      } catch (ex) {
        return callback(ex);
      }
      callback(null, res);
    });
  }

이렇게 복잡한 에러처리 코드에도 불구하고, 여기저기 산재해 있는 `callback`파라미터가 여전히 문제에요. 그렇다고 걱정하지 마세요. 우리에게 프로미스가 있으니까요. 프로미스는 자연스럽게 에러처리 하는데 도움을 주고, `callback`파라미터를 가지지 않아 코드도 더 깨끗해지고, 원래 구조에 수정을 가할 필요가 없습니다(예를 들면, 기존 API에 프로미스를 래핑해서 사용할 수 있고 순수 자바스크립트로 [구현](/implementing/)할 수도 있어요).

##[definition] 프로미스가 뭐에요?

프로미스는 쉽게 말하면 비동기 작업의 결과물을 말하는 거구요. 이게 서로 다른 세 가지 상태를 가지고 있다는 거에요.

- pending - 프로미스의 초기상태
- fullfilled - 작업을 성공적으로 마쳤을 때의 프로미스 상태
- rejected - 그와 반대로 실패했을 때의 프로미스 상태

프로미스는 일단 한 번 fullfilled(이행)되었거나 rejected(거부)되면, 상태가 뒤바뀌는 일은 없어요(다시 말하면 불변이라는 거죠).

##[construction] 프로미스 구성하기

모든 API가 프로미스를 반환한다면, 직접 뭔가 구성해야하는 일은 비교적 드물 거에요. 하지만 기존 API를 어떻게 프로미스로 만드는지 알아보도록 하죠:

:js
  function readFile(filename, enc){
    return new Promise(function (fulfill, reject){
      fs.readFile(filename, enc, function (err, res){
        if (err) reject(err);
        else fulfill(res);
      });
    });
  }

`new Promise`로 프로미스를 생성하고 실제 동작하는 내부로직을 생성자 안 팩토리 함수에 넣어줍니다. 이 팩토리 함수는 두 개의 인자와 함께 즉시 호출되는데 첫 번째 인자인 fullfill은 비동기작업의 완료를, 두 번째 인자인 reject는 비동기작업의 실패를 뜻해요. 일단 비동기(fs.readFile) 작업이 처리되면, 적절하게 이 두 함수를 호출해야겠죠?

##[done] 프로미스 기다리기

프로미스를 사용하기 위해서는 어떻게든 이행되거나 거절 될 때까지 기다려야 하는데 이를 위해 `promise.done`을 사용합니다.(이 예제를 동작시키려면 이 섹션의 마지막 경고를 참고하세요.)

이것을 가지고, 이전 `readJSON`함수를 다시 코딩하는 것은 어렵지 않아요.

:js
  function readJSON(filename){
    return new Promise(function (fulfill, reject){
      readFile(filename, 'utf8').done(function (res){
        try {
          fulfill(JSON.parse(res));
        } catch (ex) {
          reject(ex);
        }
      }, reject);
    });
  }

여전히 많은 에러 처리코드가 있긴 하지만(다음 섹션에서는 이 점을 어떻게 개선할 수 있는지 살펴볼거에요) 작성하면서 에러도 덜 나고 이제 더 이상 괴상한 추가 파라미터도 필요하지 않아요.

@panel-danger
  @panel-title
    비표준
  @panel-body
    대부분의 주요 라이브러리에서 지원하긴 하지만 `promise.done`(위 예제에서 사용한)은 표준이 아니에요. 여기서는 이해를 돕기 위해 예제코드에서 사용 되었습니다. 이 함수는 이 라이브러리와 함께 사용하는 걸 추천드려요.( [minified](https://www.promisejs.org//polyfills/promise-done-7.0.4.min.js) / [unminified](https://www.promisejs.org/polyfills/promise-done-7.0.4.js) )

    :html
      <script src="https://www.promisejs.org/polyfills/promise-done-$versions.promise$.min.js"></script>

##[then] 변형 / 체인하기

다음 예제에서 우리가 정말 하려고 하는 건 프로미스에 또 다른 작업을 잇도록 탈바꿈 시키는 거에요. 여기 예제의 경우에는 두 번째가 동기작업이지만, 다른 상황에서는 비동기 작업을 가정해 볼 수도 있어요. 다행히 프로미스는 작업들을 체인하고 변형하는 함수(완전 표준화된, [jQuery를 제외한](#jquery))들을 가지고 있습니다.

간단히 말해서, `.map`이 `forEach`와 관련이 있는 것처럼 `.then`은 `done`과 관련이 있어요. 그러니까 결과가 발생하는 어떤 작업을 할 때에는 `.then`을, 결과가 발생하는 어떤 작업을 하지 않을 것이라면 `.done`을 사용하세요.

이제 기존의 예제를 이런식으로 간단히 재작성할 수 있겠네요:

:js
  function readJSON(filename){
    return readFile(filename, 'utf8').then(function (res){
      return JSON.parse(res)
    })
  }

`JSON.parse`는 간단한 함수이기 때문에 이렇게 재작성할 수 있어요:

:js
  function readJSON(filename){
    return readFile(filename, 'utf8').then(JSON.parse);
  }

이 모습은 우리가 처음에 시작했던 동기화 예제와 매우 흡사하네요.

##[implementations] 프로미스를 구현한 라이브러리들

p 프로미스는 nodejs나 browser 둘 다 유용해요.

###[jquery] jQuery

jquery에 있는 프로미스와 그 밖에 다른 프로미스는 완전 다르다는 사실을 알리기 좋은 시간인 것 같네요. jquery의 프로미스는 비교적 좋지 못한 생각으로 만들어낸 API에요. 여러분들을 오히려 헷갈리게만 만들죠. 다행히도 jquery의 괴상한 프로미스 버전 대신에 정말 간단히 표준화된 프로미스로 변환할 수 있어요.

:js
  var jQueryPromise = $.ajax('/data.json');
  var realPromise = Promise.resolve(jQueryPromise);
  //now just use `realPromise` however you like.

###[browser] Browser

프로미스는 현재 일부 브라우저에서만 지원하고 있어요([kangax 호환표에서 확인해보세요](http://kangax.github.io/es5-compat-table/es6/#Promise)).
좋은 소식은 polyfill([minified](/polyfills/promise-$versions.promise$.min.js) / [unminified](/polyfills/promise-$versions.promise$.js))하기 아주 쉽다는 거에요:

:html
  <script src="https://www.promisejs.org/polyfills/promise-$versions.promise$.min.js"></script>

현재 `Promise.prototype.done`은 브라우저에서 지원하고 있지 않으니, 이 기능을 사용하길 원하시면, 아래 polyfill 파일을 추가해주셔야 해요.([minified](/polyfills/promise-done-$versions.promise$.min.js) / [unminified](/polyfills/promise-done-$versions.promise$.js)):

:html
  <script src="https://www.promisejs.org/polyfills/promise-done-$versions.promise$.min.js"></script>

###[node] Node.js

nodejs에서는 polyfill하는 것은 일반적이지 않은 것 같아요. 대신 필요할 때마다 라이브러리를 얻을 것이 더 나아요.

[프로미스](https://github.com/then/promise)를 설치 하려면 아래 명령어를 실행하세요:

```
npm install promise --save
```

그런 다음엔 `require`를 사용해서 변수에 할당하세요.

:js
  var Promise = require('promise');

이 "promise" 라이브러리는 몇몇 유용한 추가 함수도 제공해요.

:js
  var readFile = Promise.denodeify(require('fs').readFile);
  // 이제 `readFile`은 콜백함수을 예상하는 것 대신에 프로미스를 리턴할 거에요.

  function readJSON(filename, callback){
    // 콜백 함수가 넘어온다면, 첫 인자로 에러를 넣고
    // 두 번째 인자로 결과값을 넣어 호출합니다.
    // 그 뒤 `undefined`를 리턴하죠. 콜백 함수가 없으면,
    // 단순히 프로미스를 반환해요.
    return readFile(filename, 'utf8')
      .then(JSON.parse)
      .nodeify(callback);
  }

##[apendix] 더 많은 정보를 알고 싶다면

- [Patterns](/patterns/) - 여러분의 시간을 절약하는 다양한 헬퍼 메서드들과 프로미스의 사용패턴을 소개해요.
- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - 모질라 개발자 네트워크는 프로미스에 대한 훌륭한 문서를 제공해요.
- [YouTube](https://www.youtube.com/watch?v=qbKWsbJ76-s) - 여기서 이야기한 것 뿐만 아니라, 다양한 주제에 대한 이야기를 유튜브에서 통해 볼 수 있어요.

@pager
  @next(href="/api/")
    API Reference
