import { computed } from '../lib/computed';
import { ref, isRef, unref } from '../lib/ref';

describe('isRef', ()=> {
  it('ref', ()=> {
    const cases = [
      {
        value: ref(0),
        res: true
      },
      {
        value: 0,
        res: false
      }
    ];

    cases.forEach(({ value, res }) => {
      expect(isRef(value)).toBe(res);
    });
  });

  it('computed', ()=> {
    const cases = [
      {
        value: computed(() => 0),
        res: true
      },
      {
        value: 0,
        res: false
      }
    ];

    cases.forEach(({ value, res }) => {
      expect(isRef(value)).toBe(res);
    });
  });
});


describe('unref', () => {
  it('ref & computed', () => {
    const foo = ref(0);
    let count = 0;
    const bar = computed(()=> {
      unref(foo);
      return count++;
    });
    for (let i = 0; i < 10; i++) {
      foo.value ++;
    }
    expect(unref(foo)).toBe(unref(bar));
  });
});


describe('number reactivity', ()=>{
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

// describe('object reactivity', ()=>{
//   it('single computed ref', () => {
//     const foo = ref({ a: 1 });
//     let count = 0;
//     const bar = computed(()=> {
//       return count++;
//     });
//     for (let i = 0; i < 10; i++) {
//       foo.value ++;
//     }
//     expect(bar.value).toBe(foo.value);
//   });
// });
