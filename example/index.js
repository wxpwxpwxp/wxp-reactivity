import { computed } from '../dist/lib/computed';
import { ref } from '../dist/lib/ref';


(function() {
  const foo = ref(0);
  let count = 0;
  const bar = computed(()=> {
    foo.value;
    return count++;
  });
  for (let i = 0; i < 10; i++) {
    foo.value ++;
  }
  console.log(foo.value); // 10
  console.log(bar.value); // 10
})();

(function() {
  const foo = ref(0);
  let countBar = 0;
  const bar = computed(()=> {
    foo.value;
    return countBar++;
  });

  let countFoo = 0;
  const barfoo = computed(()=> {
    bar.value;
    return countFoo++;
  });

  for (let i = 0; i < 10; i++) {
    foo.value ++;
  }

  console.log(foo.value); // 10
  console.log(bar.value); // 10
  console.log(barfoo.value); // 10
})();
