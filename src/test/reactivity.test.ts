import { computed } from '../lib/computed';
import { reactive } from '../lib/reactive';
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

describe('reactive', ()=>{
  it('reactive no nested object', () => {
    const foo = reactive({ a: 1 });
    const bar = computed(() => foo.a);

    for (let i = 0; i < 10; i++) {
      foo.a ++;
    }

    expect(bar.value).toBe(11);
    expect(foo.a).toBe(bar.value);
  });

  it('reactive one nested object', () => {
    const foo = reactive({ a: { b: 1 } });
    const bar = computed(() => foo.a.b);
    const barbar = computed(() => foo.a);

    for (let i = 0; i < 10; i++) {
      foo.a.b ++;
    }

    expect(bar.value).toBe(11);
    expect(foo.a.b).toBe(bar.value);
    expect(barbar.value.b).toBe(bar.value);
  });
});


describe('ref', ()=> {
  it('object ref', () => {
    const objRef = ref({ a: 0 });
    let countBar = 0;
    const bar = computed(()=> {
      unref(objRef).a;
      return countBar++;
    });
    for (let i = 0; i < 10; i++) {
      unref(objRef).a ++;
    }
    expect(unref(objRef).a).toBe(10);
    expect(unref(bar)).toBe(unref(objRef).a
    );
  });

  it('reactive & ref', () => {
    const foo = ref(0);
    const obj = reactive({ a: foo });
    let countBar = 0;
    const bar = computed(()=> {
      unref(foo);
      return countBar++;
    });
    for (let i = 0; i < 10; i++) {
      foo.value ++;
    }
    expect(obj.a).toBe(unref(foo));
    expect(unref(bar)).toBe(unref(obj).a);
  });
});
