
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Plant.svelte generated by Svelte v3.19.1 */

    const file = "src/Plant.svelte";

    // (35:4) {:else}
    function create_else_block(ctx) {
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let span4;
    	let t8;
    	let span4_class_value;
    	let t9;
    	let span5;
    	let t11;
    	let span6;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "M";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "T";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "W";
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "T";
    			t7 = space();
    			span4 = element("span");
    			t8 = text("F");
    			t9 = space();
    			span5 = element("span");
    			span5.textContent = "S";
    			t11 = space();
    			span6 = element("span");
    			span6.textContent = "S";
    			attr_dev(span0, "class", "svelte-130hidh");
    			toggle_class(span0, "active", /*waterDay*/ ctx[3]("monday"));
    			add_location(span0, file, 35, 8, 852);
    			attr_dev(span1, "class", "svelte-130hidh");
    			toggle_class(span1, "active", /*waterDay*/ ctx[3]("tuesday"));
    			add_location(span1, file, 36, 8, 909);
    			attr_dev(span2, "class", "svelte-130hidh");
    			toggle_class(span2, "active", /*waterDay*/ ctx[3]("wednesday"));
    			add_location(span2, file, 37, 8, 967);
    			attr_dev(span3, "class", "svelte-130hidh");
    			toggle_class(span3, "active", /*waterDay*/ ctx[3]("thursday"));
    			add_location(span3, file, 38, 8, 1027);
    			attr_dev(span4, "class", span4_class_value = "" + (null_to_empty(/*func*/ ctx[7]) + " svelte-130hidh"));
    			add_location(span4, file, 39, 8, 1086);
    			attr_dev(span5, "class", "svelte-130hidh");
    			toggle_class(span5, "active", /*waterDay*/ ctx[3]("saturday"));
    			add_location(span5, file, 40, 8, 1144);
    			attr_dev(span6, "class", "svelte-130hidh");
    			toggle_class(span6, "active", /*waterDay*/ ctx[3]("sunday"));
    			add_location(span6, file, 41, 8, 1203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, span4, anchor);
    			append_dev(span4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, span5, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, span6, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*waterDay*/ 8) {
    				toggle_class(span0, "active", /*waterDay*/ ctx[3]("monday"));
    			}

    			if (dirty & /*waterDay*/ 8) {
    				toggle_class(span1, "active", /*waterDay*/ ctx[3]("tuesday"));
    			}

    			if (dirty & /*waterDay*/ 8) {
    				toggle_class(span2, "active", /*waterDay*/ ctx[3]("wednesday"));
    			}

    			if (dirty & /*waterDay*/ 8) {
    				toggle_class(span3, "active", /*waterDay*/ ctx[3]("thursday"));
    			}

    			if (dirty & /*waterDay*/ 8) {
    				toggle_class(span5, "active", /*waterDay*/ ctx[3]("saturday"));
    			}

    			if (dirty & /*waterDay*/ 8) {
    				toggle_class(span6, "active", /*waterDay*/ ctx[3]("sunday"));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(span4);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(span5);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(span6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(35:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if plant.needWater}
    function create_if_block(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			add_location(button, file, 33, 8, 783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[6], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:4) {#if plant.needWater}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let p;
    	let t2_value = /*plant*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let img4;
    	let img4_src_value;
    	let t6;
    	let div3_class_value;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*plant*/ ctx[0].needWater) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t4 = space();
    			img3 = element("img");
    			t5 = space();
    			img4 = element("img");
    			t6 = space();
    			if_block.c();
    			if (img0.src !== (img0_src_value = "./media/Penn.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Edit");
    			attr_dev(img0, "class", "svelte-130hidh");
    			add_location(img0, file, 22, 55, 469);
    			attr_dev(div0, "class", "pen svelte-130hidh");
    			add_location(div0, file, 22, 4, 418);
    			if (img1.src !== (img1_src_value = /*plant*/ ctx[0].image)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Plant image");
    			attr_dev(img1, "class", "svelte-130hidh");
    			add_location(img1, file, 23, 28, 543);
    			attr_dev(div1, "class", "plantimage svelte-130hidh");
    			add_location(div1, file, 23, 4, 519);
    			attr_dev(p, "class", "svelte-130hidh");
    			add_location(p, file, 24, 1, 594);
    			if (img2.src !== (img2_src_value = /*dropColor*/ ctx[4](1))) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-130hidh");
    			add_location(img2, file, 27, 8, 646);
    			if (img3.src !== (img3_src_value = /*dropColor*/ ctx[4](2))) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "svelte-130hidh");
    			add_location(img3, file, 28, 8, 679);
    			if (img4.src !== (img4_src_value = /*dropColor*/ ctx[4](3))) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "svelte-130hidh");
    			add_location(img4, file, 29, 8, 712);
    			attr_dev(div2, "class", "drop svelte-130hidh");
    			add_location(div2, file, 26, 4, 619);
    			attr_dev(div3, "class", div3_class_value = "plant " + (/*plant*/ ctx[0].needWater ? "needWater" : "") + " svelte-130hidh");
    			add_location(div3, file, 21, 0, 357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, img1);
    			append_dev(div3, t1);
    			append_dev(div3, p);
    			append_dev(p, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, img2);
    			append_dev(div2, t4);
    			append_dev(div2, img3);
    			append_dev(div2, t5);
    			append_dev(div2, img4);
    			append_dev(div3, t6);
    			if_block.m(div3, null);
    			dispose = listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*plant*/ 1 && img1.src !== (img1_src_value = /*plant*/ ctx[0].image)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*plant*/ 1 && t2_value !== (t2_value = /*plant*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			}

    			if (dirty & /*plant*/ 1 && div3_class_value !== (div3_class_value = "plant " + (/*plant*/ ctx[0].needWater ? "needWater" : "") + " svelte-130hidh")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { plant } = $$props;
    	let { remove } = $$props;
    	let { showPlant } = $$props;

    	const waterDay = day => {
    		return plant.days.includes(day);
    	};

    	const dropColor = index => {
    		if (plant.thirsty >= index) {
    			return "./media/bluedrop.png";
    		} else {
    			return "./media/drop.png";
    		}
    	};

    	const writable_props = ["plant", "remove", "showPlant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Plant> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => showPlant(plant);
    	const click_handler_1 = () => remove(plant);
    	const func = () => waterDay("friday");

    	$$self.$set = $$props => {
    		if ("plant" in $$props) $$invalidate(0, plant = $$props.plant);
    		if ("remove" in $$props) $$invalidate(1, remove = $$props.remove);
    		if ("showPlant" in $$props) $$invalidate(2, showPlant = $$props.showPlant);
    	};

    	$$self.$capture_state = () => ({
    		plant,
    		remove,
    		showPlant,
    		waterDay,
    		dropColor
    	});

    	$$self.$inject_state = $$props => {
    		if ("plant" in $$props) $$invalidate(0, plant = $$props.plant);
    		if ("remove" in $$props) $$invalidate(1, remove = $$props.remove);
    		if ("showPlant" in $$props) $$invalidate(2, showPlant = $$props.showPlant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		plant,
    		remove,
    		showPlant,
    		waterDay,
    		dropColor,
    		click_handler,
    		click_handler_1,
    		func
    	];
    }

    class Plant extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { plant: 0, remove: 1, showPlant: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plant",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*plant*/ ctx[0] === undefined && !("plant" in props)) {
    			console.warn("<Plant> was created without expected prop 'plant'");
    		}

    		if (/*remove*/ ctx[1] === undefined && !("remove" in props)) {
    			console.warn("<Plant> was created without expected prop 'remove'");
    		}

    		if (/*showPlant*/ ctx[2] === undefined && !("showPlant" in props)) {
    			console.warn("<Plant> was created without expected prop 'showPlant'");
    		}
    	}

    	get plant() {
    		throw new Error("<Plant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plant(value) {
    		throw new Error("<Plant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Plant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Plant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showPlant() {
    		throw new Error("<Plant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showPlant(value) {
    		throw new Error("<Plant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const plants = [
        {
            image: './media/solsikke.jpg',
            name: 'Solsikke',
            thirsty: 2,
            days: ['tuesday', 'friday'],
        },

        {
            image: './media/plantex1.jpg',
            name: 'Palme',
            thirsty: 1,
            days: ['monday', 'thursday'],
        },

        {
            image: './media/monstera.webp',
            name: 'Monstera',
            thirsty: 3,
            days: ['monday', 'tuesday', 'friday'],
        },

        {
            image: './media/orkidé.jpg',
            name: 'Orkidé',
            thirsty: 1,
            days: ['monday'],
        }
    ];

    /* src/EditPlant.svelte generated by Svelte v3.19.1 */

    const file$1 = "src/EditPlant.svelte";

    function create_fragment$1(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let button0;
    	let t2;
    	let div1;
    	let h20;
    	let t4;
    	let input;
    	let input_placeholder_value;
    	let t5;
    	let div2;
    	let h21;
    	let t7;
    	let button1;
    	let t9;
    	let button2;
    	let t11;
    	let button3;
    	let t13;
    	let button4;
    	let t15;
    	let button5;
    	let t17;
    	let button6;
    	let t19;
    	let button7;
    	let t21;
    	let div4;
    	let h22;
    	let t23;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t24;
    	let img2;
    	let img2_src_value;
    	let t25;
    	let img3;
    	let img3_src_value;
    	let t26;
    	let div5;
    	let button8;
    	let t28;
    	let button9;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Change photo";
    			t2 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Name your plant:";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "What day should you water?";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Monday";
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "Tusday";
    			t11 = space();
    			button3 = element("button");
    			button3.textContent = "Wednesday";
    			t13 = space();
    			button4 = element("button");
    			button4.textContent = "Thursday";
    			t15 = space();
    			button5 = element("button");
    			button5.textContent = "Friday";
    			t17 = space();
    			button6 = element("button");
    			button6.textContent = "Saturday";
    			t19 = space();
    			button7 = element("button");
    			button7.textContent = "Sunday";
    			t21 = space();
    			div4 = element("div");
    			h22 = element("h2");
    			h22.textContent = "How much water?";
    			t23 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t24 = space();
    			img2 = element("img");
    			t25 = space();
    			img3 = element("img");
    			t26 = space();
    			div5 = element("div");
    			button8 = element("button");
    			button8.textContent = "Close";
    			t28 = space();
    			button9 = element("button");
    			button9.textContent = "Save";
    			if (img0.src !== (img0_src_value = /*editPlant*/ ctx[0].image)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "plantphoto");
    			attr_dev(img0, "class", "svelte-1u15k6u");
    			add_location(img0, file$1, 8, 12, 126);
    			attr_dev(button0, "class", "svelte-1u15k6u");
    			add_location(button0, file$1, 9, 12, 185);
    			attr_dev(div0, "class", "plantimage svelte-1u15k6u");
    			add_location(div0, file$1, 7, 8, 88);
    			attr_dev(h20, "class", "svelte-1u15k6u");
    			add_location(h20, file$1, 13, 12, 276);
    			attr_dev(input, "class", "input svelte-1u15k6u");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*editPlant*/ ctx[0].name);
    			add_location(input, file$1, 14, 12, 314);
    			attr_dev(div1, "class", "plantname");
    			add_location(div1, file$1, 12, 8, 240);
    			attr_dev(h21, "class", "svelte-1u15k6u");
    			add_location(h21, file$1, 18, 12, 438);
    			attr_dev(button1, "class", "svelte-1u15k6u");
    			add_location(button1, file$1, 19, 12, 486);
    			attr_dev(button2, "class", "svelte-1u15k6u");
    			add_location(button2, file$1, 20, 12, 522);
    			attr_dev(button3, "class", "svelte-1u15k6u");
    			add_location(button3, file$1, 21, 12, 558);
    			attr_dev(button4, "class", "svelte-1u15k6u");
    			add_location(button4, file$1, 22, 12, 597);
    			attr_dev(button5, "class", "svelte-1u15k6u");
    			add_location(button5, file$1, 23, 12, 635);
    			attr_dev(button6, "class", "svelte-1u15k6u");
    			add_location(button6, file$1, 24, 12, 671);
    			attr_dev(button7, "class", "svelte-1u15k6u");
    			add_location(button7, file$1, 25, 12, 709);
    			attr_dev(div2, "class", "waterday svelte-1u15k6u");
    			add_location(div2, file$1, 17, 8, 403);
    			attr_dev(h22, "class", "svelte-1u15k6u");
    			add_location(h22, file$1, 29, 12, 795);
    			if (img1.src !== (img1_src_value = "./media/drop.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "drop");
    			attr_dev(img1, "class", "svelte-1u15k6u");
    			add_location(img1, file$1, 31, 20, 862);
    			if (img2.src !== (img2_src_value = "./media/drop.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "drop");
    			attr_dev(img2, "class", "svelte-1u15k6u");
    			add_location(img2, file$1, 32, 20, 922);
    			if (img3.src !== (img3_src_value = "./media/drop.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "drop");
    			attr_dev(img3, "class", "svelte-1u15k6u");
    			add_location(img3, file$1, 33, 20, 982);
    			add_location(div3, file$1, 30, 16, 836);
    			attr_dev(div4, "class", "wateramount svelte-1u15k6u");
    			add_location(div4, file$1, 28, 8, 757);
    			attr_dev(button8, "class", "svelte-1u15k6u");
    			add_location(button8, file$1, 38, 12, 1108);
    			attr_dev(button9, "class", "svelte-1u15k6u");
    			add_location(button9, file$1, 39, 12, 1143);
    			attr_dev(div5, "class", "closeandsave svelte-1u15k6u");
    			add_location(div5, file$1, 37, 8, 1069);
    			add_location(div6, file$1, 6, 4, 74);
    			attr_dev(div7, "class", "plantedit svelte-1u15k6u");
    			add_location(div7, file$1, 5, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(div6, t2);
    			append_dev(div6, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t4);
    			append_dev(div1, input);
    			append_dev(div6, t5);
    			append_dev(div6, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t7);
    			append_dev(div2, button1);
    			append_dev(div2, t9);
    			append_dev(div2, button2);
    			append_dev(div2, t11);
    			append_dev(div2, button3);
    			append_dev(div2, t13);
    			append_dev(div2, button4);
    			append_dev(div2, t15);
    			append_dev(div2, button5);
    			append_dev(div2, t17);
    			append_dev(div2, button6);
    			append_dev(div2, t19);
    			append_dev(div2, button7);
    			append_dev(div6, t21);
    			append_dev(div6, div4);
    			append_dev(div4, h22);
    			append_dev(div4, t23);
    			append_dev(div4, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t24);
    			append_dev(div3, img2);
    			append_dev(div3, t25);
    			append_dev(div3, img3);
    			append_dev(div6, t26);
    			append_dev(div6, div5);
    			append_dev(div5, button8);
    			append_dev(div5, t28);
    			append_dev(div5, button9);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*editPlant*/ 1 && img0.src !== (img0_src_value = /*editPlant*/ ctx[0].image)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*editPlant*/ 1 && input_placeholder_value !== (input_placeholder_value = /*editPlant*/ ctx[0].name)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { editPlant } = $$props;
    	const writable_props = ["editPlant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditPlant> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("editPlant" in $$props) $$invalidate(0, editPlant = $$props.editPlant);
    	};

    	$$self.$capture_state = () => ({ editPlant });

    	$$self.$inject_state = $$props => {
    		if ("editPlant" in $$props) $$invalidate(0, editPlant = $$props.editPlant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [editPlant];
    }

    class EditPlant extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { editPlant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditPlant",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*editPlant*/ ctx[0] === undefined && !("editPlant" in props)) {
    			console.warn("<EditPlant> was created without expected prop 'editPlant'");
    		}
    	}

    	get editPlant() {
    		throw new Error("<EditPlant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editPlant(value) {
    		throw new Error("<EditPlant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.1 */
    const file$2 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (51:0) {:else}
    function create_else_block$1(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let div1;
    	let t3;
    	let h20;
    	let t5;
    	let div2;
    	let t6;
    	let h21;
    	let t8;
    	let div3;
    	let current;
    	let each_value_1 = /*needWater*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each0_else = null;

    	if (!each_value_1.length) {
    		each0_else = create_else_block_2(ctx);
    	}

    	let each_value = /*garden*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each1_else = null;

    	if (!each_value.length) {
    		each1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Add new plant";
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			h20 = element("h2");
    			h20.textContent = "Need water now";
    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			if (each0_else) {
    				each0_else.c();
    			}

    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "My Garden";
    			t8 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each1_else) {
    				each1_else.c();
    			}

    			attr_dev(img, "id", "addbutton");
    			if (img.src !== (img_src_value = "../public/media/addplant.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "addbutton");
    			attr_dev(img, "class", "svelte-1p7kdlt");
    			add_location(img, file$2, 54, 2, 1028);
    			attr_dev(h1, "class", "svelte-1p7kdlt");
    			add_location(h1, file$2, 55, 2, 1102);
    			attr_dev(div0, "id", "addplant");
    			attr_dev(div0, "class", "svelte-1p7kdlt");
    			add_location(div0, file$2, 53, 1, 1005);
    			attr_dev(div1, "id", "addtogarden");
    			attr_dev(div1, "class", "svelte-1p7kdlt");
    			add_location(div1, file$2, 58, 1, 1135);
    			attr_dev(h20, "class", "svelte-1p7kdlt");
    			add_location(h20, file$2, 61, 1, 1168);
    			attr_dev(div2, "id", "needwater");
    			attr_dev(div2, "class", "svelte-1p7kdlt");
    			add_location(div2, file$2, 62, 1, 1193);
    			attr_dev(h21, "class", "svelte-1p7kdlt");
    			add_location(h21, file$2, 71, 2, 1363);
    			attr_dev(div3, "id", "garden");
    			attr_dev(div3, "class", "svelte-1p7kdlt");
    			add_location(div3, file$2, 72, 1, 1383);
    			attr_dev(div4, "id", "plantview");
    			attr_dev(div4, "class", "svelte-1p7kdlt");
    			add_location(div4, file$2, 51, 1, 982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div4, t3);
    			append_dev(div4, h20);
    			append_dev(div4, t5);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			if (each0_else) {
    				each0_else.m(div2, null);
    			}

    			append_dev(div4, t6);
    			append_dev(div4, h21);
    			append_dev(div4, t8);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (each1_else) {
    				each1_else.m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*needWater, remove, showPlant*/ 25) {
    				each_value_1 = /*needWater*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (each_value_1.length) {
    				if (each0_else) {
    					each0_else.d(1);
    					each0_else = null;
    				}
    			} else if (!each0_else) {
    				each0_else = create_else_block_2(ctx);
    				each0_else.c();
    				each0_else.m(div2, null);
    			}

    			if (dirty & /*garden, showPlant*/ 18) {
    				each_value = /*garden*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (each_value.length) {
    				if (each1_else) {
    					each1_else.d(1);
    					each1_else = null;
    				}
    			} else if (!each1_else) {
    				each1_else = create_else_block_1(ctx);
    				each1_else.c();
    				each1_else.m(div3, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_1, detaching);
    			if (each0_else) each0_else.d();
    			destroy_each(each_blocks, detaching);
    			if (each1_else) each1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(51:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:0) {#if editPlant}
    function create_if_block$1(ctx) {
    	let current;

    	const editplant = new EditPlant({
    			props: { editPlant: /*editPlant*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(editplant.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editplant, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editplant_changes = {};
    			if (dirty & /*editPlant*/ 4) editplant_changes.editPlant = /*editPlant*/ ctx[2];
    			editplant.$set(editplant_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editplant.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editplant.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editplant, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:0) {#if editPlant}",
    		ctx
    	});

    	return block;
    }

    // (66:2) {:else}
    function create_else_block_2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "No thirsty plants";
    			attr_dev(h2, "class", "message svelte-1p7kdlt");
    			add_location(h2, file$2, 66, 3, 1298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(66:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#each needWater as plant}
    function create_each_block_1(ctx) {
    	let current;

    	const plant = new Plant({
    			props: {
    				plant: /*plant*/ ctx[9],
    				remove: /*remove*/ ctx[3],
    				showPlant: /*showPlant*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(plant.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(plant, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const plant_changes = {};
    			if (dirty & /*needWater*/ 1) plant_changes.plant = /*plant*/ ctx[9];
    			plant.$set(plant_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(plant.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plant.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(plant, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(64:2) {#each needWater as plant}",
    		ctx
    	});

    	return block;
    }

    // (76:2) {:else}
    function create_else_block_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "You have no plants in your garden";
    			attr_dev(h2, "class", "message svelte-1p7kdlt");
    			add_location(h2, file$2, 76, 3, 1472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(76:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:2) {#each garden as plant}
    function create_each_block(ctx) {
    	let current;

    	const plant = new Plant({
    			props: {
    				plant: /*plant*/ ctx[9],
    				showPlant: /*showPlant*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(plant.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(plant, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const plant_changes = {};
    			if (dirty & /*garden*/ 2) plant_changes.plant = /*plant*/ ctx[9];
    			plant.$set(plant_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(plant.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plant.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(plant, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(74:2) {#each garden as plant}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*editPlant*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			img = element("img");
    			t = space();
    			if_block.c();
    			if (img.src !== (img_src_value = "../public/media/logo_light.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "plantminder logo");
    			attr_dev(img, "class", "svelte-1p7kdlt");
    			add_location(img, file$2, 44, 1, 855);
    			attr_dev(div, "id", "logo");
    			attr_dev(div, "class", "svelte-1p7kdlt");
    			add_location(div, file$2, 43, 0, 838);
    			attr_dev(main, "class", "svelte-1p7kdlt");
    			add_location(main, file$2, 41, 0, 830);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, img);
    			append_dev(main, t);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let allPlants = plants;
    	let needWater = [];
    	let garden = [];
    	let editPlant = undefined;
    	const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    	let day = days[new Date().getDay()];
    	console.log(day);
    	allPlants.map(p => p.needWater = p.days.includes(day));

    	const checkPlants = () => {
    		$$invalidate(0, needWater = allPlants.filter(plant => plant.needWater));
    		$$invalidate(1, garden = allPlants.filter(plant => !plant.needWater));
    	};

    	checkPlants();
    	console.log(allPlants);
    	setInterval(checkPlants, 5000);

    	const remove = plant => {
    		plant.needWater = false;
    		checkPlants();
    		console.log(plant);
    	};

    	const showPlant = plant => {
    		console.log(plant);
    		$$invalidate(2, editPlant = plant);
    	};

    	$$self.$capture_state = () => ({
    		Plant,
    		plants,
    		EditPlant,
    		allPlants,
    		needWater,
    		garden,
    		editPlant,
    		days,
    		day,
    		checkPlants,
    		remove,
    		showPlant,
    		undefined,
    		Date,
    		console,
    		setInterval
    	});

    	$$self.$inject_state = $$props => {
    		if ("allPlants" in $$props) allPlants = $$props.allPlants;
    		if ("needWater" in $$props) $$invalidate(0, needWater = $$props.needWater);
    		if ("garden" in $$props) $$invalidate(1, garden = $$props.garden);
    		if ("editPlant" in $$props) $$invalidate(2, editPlant = $$props.editPlant);
    		if ("day" in $$props) day = $$props.day;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [needWater, garden, editPlant, remove, showPlant];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
