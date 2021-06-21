import { computed } from '../lib/computed';
import { ref } from '../lib/ref';


describe('reactivity', ()=>{
  it('numbers get last by arrayLast', () => {
    const foo = ref(1);
    const bar = computed(()=> {
      return foo.value + 10;
    });
    foo.value ++;
    expect(bar.value).toBe(12);
  });
});
