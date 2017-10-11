// From: https://devblog.digimondo.io/building-a-json-tree-view-component-in-vue-js-from-scratch-in-six-steps-ce0c05c2fdd8
// Author: Arvid Kahl - https://github.com/arvidkahl
// Made some bugfixes to original code.

Vue.component("tree-view-item", Vue.extend({
                                               name: "tree-view-item",
                                               props: ["data", "max-depth", "current-depth"],
                                               data: function(){
                                                   return {
                                                       open: this.currentDepth < this.maxDepth
                                                   }
                                               },
                                               methods: {
                                                   isOpen: function(){
                                                       return this.isRootObject(this.data) || this.open;
                                                   },
                                                   toggleOpen:function(){
                                                       this.open = !this.open;
                                                   },
                                                   isObject: function(value){
                                                       return value.type === 'object';
                                                   },
                                                   isArray: function(value){
                                                       return value.type === 'array';
                                                   },
                                                   isValue: function(value){
                                                       return value.type === 'value';
                                                   },
                                                   getKey: function(value){
                                                       if (_.isInteger(value.key)) {
                                                           return value.key+":";
                                                       } else {
                                                           return "\""+ value.key + "\":";
                                                       }
                                                   },
                                                   getValue: function(value){
                                                       if (_.isNumber(value.value)) {
                                                           return value.value
                                                       }
                                                       if (_.isNull(value.value)) {
                                                           return "null"
                                                       }
                                                       if (_.isString(value.value)) {}
                                                       return "\""+value.value+"\"";
                                                   },
                                                   isRootObject: function(value){
                                                       return value.isRoot;
                                                   }
                                               },
                                               template:`
  	<div class="tree-view-item">
    	<div v-if="isObject(data)" class="tree-view-item-leaf">
      	<div class="tree-view-item-node" @click.stop="toggleOpen()">         	
       		<span :class="{opened: isOpen()}" v-if="!isRootObject(data)" class="tree-view-item-key tree-view-item-key-with-chevron">{{getKey(data)}}</span>
          <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length === 1">{{data.children.length}} property</span>
          <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length !== 1">{{data.children.length}} properties</span>
        </div>
				<tree-view-item :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="child in data.children" :data="child"></tree-view-item>
      </div>
    	<div v-if="isArray(data)" class="tree-view-item-leaf">
      	<div class="tree-view-item-node" @click.stop="toggleOpen()">
       		<span :class="{opened: isOpen()}" v-if="!isRootObject(data)" class="tree-view-item-key tree-view-item-key-with-chevron">{{getKey(data)}}</span>
          <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length === 1">{{data.children.length}} item</span>
          <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length !== 1">{{data.children.length}} items</span>
        </div>
				<tree-view-item :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="child in data.children" :data="child"></tree-view-item>
      </div>
    	<div class="tree-view-item-leaf" v-if="isValue(data)">
        <span class="tree-view-item-key">{{getKey(data)}}</span>       
        <span class="tree-view-item-value">{{getValue(data)}}</span>
      </div>
    </div>
  `
                                           }));

Vue.component("tree-view", Vue.extend({
                                          name: "tree-view",
                                          props: ["data", "max-depth"],
                                          template: `
  	<div class="tree-view-wrapper">
    	<tree-view-item class="tree-view-item-root" :data="parsedData" :max-depth="maxDepth" :currentDepth="0"></tree-view-item>
    </div>`,
                                          methods: {

                                              // Transformer for the non-Collection types,
                                              // like String, Integer of Float
                                              transformValue: function(valueToTransform, keyForValue){
                                                  return {
                                                      key: keyForValue,
                                                      type: "value",
                                                      value: valueToTransform
                                                  }
                                              },

                                              // Since we use lodash, the _.map method will work on
                                              // both Objects and Arrays, returning either the Key as
                                              // a string or the Index as an integer
                                              generateChildrenFromCollection: function(collection){
                                                  return _.map(collection, (value, keyOrIndex)=>{
                                                      if (this.isObject(value)) {
                                                      return this.transformObject(value, keyOrIndex);
                                                  }
                                                  if (this.isArray(value)) {
                                                      return this.transformArray(value, keyOrIndex);
                                                  }
                                                  if (this.isValue(value)) {
                                                      return this.transformValue(value, keyOrIndex);
                                                  }
                                              }) ;
                                              },

                                              // Transformer for the Array type
                                              transformArray: function(arrayToTransform, keyForArray){
                                                  return {
                                                      key: keyForArray,
                                                      type: "array",
                                                      children: this.generateChildrenFromCollection(arrayToTransform)
                                                  }
                                              },

                                              // Transformer for the Object type
                                              transformObject: function(objectToTransform, keyForObject, isRootObject = false){
                                                  return {
                                                      key: keyForObject,
                                                      type: "object",
                                                      isRoot: isRootObject,
                                                      children: this.generateChildrenFromCollection(objectToTransform)
                                                  }
                                              },

                                              // Helper Methods for value type detection
                                              isObject: function(value){
                                                  return _.isPlainObject(value);
                                              },

                                              isArray: function(value){
                                                  return _.isArray(value);
                                              },

                                              isValue: function(value){
                                                  return !this.isObject(value) && !this.isArray(value);
                                              }
                                          },
                                          computed: {
                                              parsedData: function(){
                                                  // Take the JSON data and transform
                                                  // it into the Tree View DSL
                                                  return this.transformObject(this.data, "root", true);
                                              }
                                          }
                                      }));
