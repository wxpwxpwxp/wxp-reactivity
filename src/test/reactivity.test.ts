import { computed } from '../lib/computed';
import { ref } from '../lib/ref';


describe('reactivity', ()=>{
  it('single computed ref', () => {
    const foo = ref(0);
    let count = 0;
    const bar = computed(()=> {
      foo.value;
      return count++;
    });
    for (let i = 0; i < 10; i++) {
      foo.value ++;
    }
    expect(bar.value).toBe(foo.value);
  });

  it('nested computed ref', () => {
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

    expect(foo.value).toBe(bar.value);
    expect(barfoo.value).toBe(bar.value);
  });
});
