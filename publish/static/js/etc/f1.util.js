/**
 * 1. StringUtils
 *  - defaultIfBlank( input string값, 디폴트 값 ) : input이 null일 시 원하는 디폴트 값 세팅
 * 
 * 2. ObjectUtils
 * - isEmpty ( object ) : 객체가 빈 객체인지 확인
 * - isNotEmpty ( object ) : 객체가 빈 객체인지 확인
 * 
 * 3. ArrayUtils
 * - isNotEmpty ( 배열 ) : 배열이 빈 배열인지 확인 
 * 
 * 4. NodeUtils
 * - removeOnlyCurrentNode( currentNode ) : DOM 노드 중 현재 자신 노드만 제거. 즉 parent <-> 자기자식 연결.
 * - AtoBMoveChilden( targetNode, removeNode ) : removeNode의 자식들을 targetNode에 추가 
 * - removeAllChilden( currentNode ) : 현재 자기 노드의 모든 자식 노드 제거
 * - hasClass( node ) : 특정 노트에 class 존재하는지 확인
 */

class StringUtils {
    static defaultIfBlank( string, defaultStr ){
        let result = string;
        
        if( typeof string === 'number' ){
            result = parseInt(string);
        } else if( typeof string === 'undefined' || string === null ){
            result = defaultStr;
        }

        return result;
    }
}

class ObjectUtils {
    static isEmpty( obj ){
        return Object.keys(obj).length === 0;
    }

    static isNotEmpty( obj ){
        return Object.keys(obj).length !== 0;
    }
}

class ArrayUtils {
    static isNotEmpty( array ){
        return array && array.length > 0;
    }
}

class NodeUtils {
    static removeOnlyCurrentNode( currentNode ){
        const parentNode = currentNode.parentNode;
        
        while( currentNode.childNodes.length > 0  ){
            const child = currentNode.childNodes[0];
            parentNode.insertBefore( child, currentNode);
        }
        parentNode.removeChild( currentNode );
    }

    static AtoBMoveChilden( targetNode, removeNode ){
        if( removeNode ){
            while( removeNode.childNodes.length > 0 ){
                targetNode.appendChild(removeNode.childNodes[0]);
            }
        }
    }

    static removeAllChilden( currentNode ){
        if( currentNode && currentNode.childNodes.length > 0 ){
            while( currentNode.childNodes.length > 0 ){
                currentNode.removeChild(currentNode.childNodes[0]);
            }
        }
    }
}

class Stack {

    constructor(){
        this.top =-1;
        this.stackAttay = [];
    }

    push ( input ){
        this.top++;
        this.stackAttay.push(input);
    }

    pop(){
        this.top--;
        return this.stackAttay.pop();
    }

    peak(){
        if( this.isEmpty() ){
            throw new Error('stack이 비었습니다.');
        } else {
            return this.stackAttay[this.top];
        }
    }

    isEmpty(){
        return this.top == -1;
    }

}

/**
 * Calculator.cal('2*4') : String input 계산기
 */
class Calculator {
    static postfix( inputString ){
        let result = [inputString];
        const split = Calculator.splitText ( inputString );
    
        if( split.length > 0 ){
                const stack = new Stack();
                const lowData = inputString.replace(/ /g,'');
                let temp = [];
                const operatorSet = {
                    '*' : 5,
                    '%' : 5,
                    '/' : 5,
                    '+' : 4,
                    '-' : 4,
                    '&&' : 3,
                    '||' : 3,
                    '==' : 3,
                    '<=' : 3,
                    '>=' : 3,
                    '<' : 3,
                    '>' : 3
                };
                for( const oneText of split ){
                    if( oneText === "(" ){
                        stack.push(oneText);
                    } else if(oneText === ")") {
                        let popData = stack.pop();
                        while( popData !== "(" ){
                            temp.push(popData);
                            popData = stack.pop();
                        }
                    } else if( operatorSet.hasOwnProperty(oneText) ){
                        if( stack.isEmpty() ){
                            stack.push(oneText);
                        } else {
                            while( !stack.isEmpty()  && operatorSet[stack.peak()] >= operatorSet[oneText]){
                                temp.push(stack.pop());
                            }
                            stack.push(oneText);
                        }
                    } else {
                        temp.push(oneText);
                    }
                }
                
                while( !stack.isEmpty() ){
                    temp.push(stack.pop());
                }
    
                result = temp;
            }
    
            return result;
        }

        static cal( inputString ){
        const postfixData = Calculator.postfix( inputString );
        return Calculator.calPost( postfixData );
    }
    
    static calPost( postfixData ){
        let result = postfixData[0];
    
        if( postfixData && postfixData.length ){
            const stack = new Stack();
            const operatorSet = {
                '*' : function (x, y) { return parseInt(x) * parseInt(y) },
                '%' : function (x, y) { return parseInt(x) % parseInt(y) },
                '/' : function (x, y) { return parseInt(x) / parseInt(y) },
                '+' : function (x, y) { return parseInt(x) + parseInt(y) },
                '-' : function (x, y) { return parseInt(x) - parseInt(y) },
                '&&' : function (x, y) { return x && y },
                '||' : function (x, y) { return x || y },
                '==' : function (x, y) { return x == y },
                '<=' : function (x, y) { return parseInt(y) <= arseInt(x) },
                '>=' : function (x, y) { return parseInt(y) >= parseInt(x) },
                '>' : function (x, y) { return parseInt(y) > parseInt(x) },
                '<' : function (x, y) { return parseInt(y) < parseInt(x) }
            };
            
            for( const item of postfixData ){
                if( operatorSet.hasOwnProperty(item) ){
                    const first = stack.pop();
                    const second = stack.pop();
                    stack.push( operatorSet[item](first,second) )
                } else {
                    stack.push(item);
                }
            }
    
            result = stack.pop();
    
        }
    
        return result;
    }

    static splitText ( inputString ){
        let resut = [];
        if( inputString ){
            
            const lowData = inputString.replace(/ /g,'').replace( /([*%\/+\-()]|==|<=|>=|>|<|&&|\|\|)/g, ( matchString, innerText , offset, fullText )=>{
                if( innerText ){
                    return ' '+innerText+' ';
                } else {
                    return innerText;
                }
            }).replace(/  /g,' ').trim();
    
            resut = lowData.split(' ');
    
        }
    
        return resut;
    }
}

class JTemplate {
    static sharedObj = {
        'COMPONENT_CLASS' : 'jtemplates',
        'COMPONENT_NAME' : 'data-jly-componentName',
        'COMPONENT_TEMPLATE' : 'data-jly-template',
        'COMPONENT_TEST' : 'data-jly-test',
        'COMPONENT_ATTRIBUTE' : 'data-jly-attribute',
        'COMPONENT_TEXT' : 'data-jly-text',
        'COMPONENT_LIST' : 'data-jly-list',
        'COMPONENT_REAPEAT' : 'data-jly-reapeat',
        'COMPONENT_VAR' : 'data-jly-var',
        'COMPONENT_INJECTION' : 'data-jly-injection',
        'component' : {}
    }
    
    constructor( componentName ){
        this.componentName = componentName;
        this.templates = JTemplate.sharedObj.component[componentName] || {};
    }

    injectModel( targetDom, templateName , drawObj ){
        const childrenDom = parsingChildrenDom( this, templateName , drawObj );
        if(  ArrayUtils.isNotEmpty( targetDom )){
            for( const dom of targetDom ){
                const cloneChildrenDom = childrenDom.cloneNode(true);
                dom.parentNode.replaceChild( cloneChildrenDom.childNodes[0] ,dom );
            }
        } else {
            throw new Error(`injectModel을 하기 위한 targetDom이 없습니다. injectModel 파라메터를 확인하세요`);
        }

    }

    static HTMLWrapperparsing( componentName ){
        const templates = document.getElementsByClassName(JTemplate.sharedObj.COMPONENT_CLASS);
        const sharedObj = JTemplate.sharedObj;

        while ( templates.length > 0 ){
            const templateSection  = templates[0];
            const parentNode = templateSection.parentElement;
            let htmlComponentName = StringUtils.defaultIfBlank(templateSection.getAttribute(sharedObj.COMPONENT_NAME), '').trim();
            
            errCheck( htmlComponentName, sharedObj.component, sharedObj.COMPONENT_NAME );
            
            const  targetComponent = sharedObj.component[htmlComponentName] = {};
            const children = templateSection.children;
            
            for( const child of children ){
                const templatePatternName = StringUtils.defaultIfBlank(child.getAttribute( sharedObj.COMPONENT_TEMPLATE )).trim();
                const patternData  = getPatternData( templatePatternName );
                const templateName = patternData[0];

                errCheck( templateName, targetComponent, sharedObj.COMPONENT_TEMPLATE );

                targetComponent[templateName] = {
                    'HTML' : child
                }
            }
            parentNode.removeChild( templateSection )
        }

        return new JTemplate( componentName );
    }
}

function settingVar( currentNode, drawObj, variable, indexList, currentAttrNames ){
    if( indexList !== -1 ){
        for( const index of indexList ){
            const attrDotName = currentAttrNames[index];
            const dotSplitName = dotSplit( attrDotName );
            const attrName = dotSplitName[0];
            const attrValue = currentNode.getAttribute(attrDotName);

            if( attrValue ){
                const patternData = getPatternData( attrValue, variable );
                if(!dotSplitName[1]){
                    throw new Error(`${sharedObj.COMPONENT_VAR}.{변수이름} 형태가 되어야 합니다.`)
                }
                variable[dotSplitName[1]] = patternData[0];
            }

            currentNode.removeAttribute(attrDotName);
        }
    }
}

function settingAttr( currentNode, drawObj, variable, index, currentAttrNames ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);

        if( attrValue ){
            const patternData = getPatternData( attrValue, variable )[0];
            for( const key in patternData ){
                currentNode.setAttribute( key, patternData[key] );
            }
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function parsingChildrenDom( classObj, templateName , drawObj ){

    const template = classObj.templates[templateName];
    if( templateName && template ){
        const parseDom = template.HTML;
        const parentDom = document.createElement('div');
        parentDom.appendChild( parseDom.cloneNode(true) );
        recursionChild( parentDom, drawObj, {}, classObj );

        return parentDom;

    } else {
        throw new Error(`templateName이 잘못됐습니다. ${templateName}을 확인하세요`);
    }
};

function recursionChild( currentNode, drawObj, variable, classObj ){
    changeCurrentNodeToTemplateData( currentNode, drawObj, variable, classObj );
    const childNodes = currentNode.childNodes;
    if( childNodes && childNodes.length > 0  ){
        for( const child of childNodes ){
            const variClone = {...variable};
            recursionChild( child, drawObj, variClone, classObj );
        }
    }
    
    if( currentNode.nodeName.indexOf("JLY") >-1 ){
        NodeUtils.removeOnlyCurrentNode(currentNode);
    }
    
}

function changeCurrentNodeToTemplateData ( currentNode, drawObj, variable, classObj ){
    if( currentNode.nodeType === 1 ){
        const sharedObj = JTemplate.sharedObj;
        const currentAttrNames = currentNode.getAttributeNames();
        const checkingAttr = [];
        const compNameIndex = {
            [sharedObj.COMPONENT_TEMPLATE] : -1,
            [sharedObj.COMPONENT_VAR] : -1,
            [sharedObj.COMPONENT_TEST] : -1,
            [sharedObj.COMPONENT_ATTRIBUTE] : -1,
            [sharedObj.COMPONENT_TEXT] : -1,
            [sharedObj.COMPONENT_LIST] : -1,
            [sharedObj.COMPONENT_REAPEAT] : -1,
            [sharedObj.COMPONENT_INJECTION] : -1
        }
        
        checkingCurrentAttr ( checkingAttr, compNameIndex, currentAttrNames, currentNode );
        settingTemplate( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_TEMPLATE], currentAttrNames );

        let goNext = settingTest( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_TEST], currentAttrNames );

        if( goNext ){
            settingVar( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_VAR], currentAttrNames );
            settingAttr( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_ATTRIBUTE], currentAttrNames );
            settingList( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_LIST], currentAttrNames, classObj );
            settingReapeat( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_REAPEAT], currentAttrNames, classObj);
            settingText( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_TEXT], currentAttrNames );
            settingInjection( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_INJECTION], currentAttrNames, classObj );
        }
        settingRest( checkingAttr, currentNode, variable);
    } else if(currentNode.nodeType === 3){
        const textContent = currentNode.textContent.trim();
        let isHTML = false;
        if( textContent.indexOf('}}') > -1){
            const innerTextSplit = textContent.replace(/{{([^{}]*)}}/g, function( matchString, innerText , offset, fullText ){
                if( innerText ){
                    const temp = getPatternData( matchString, variable );
                    if( temp.length > 1){
                        const contextText = temp[1].toLowerCase();
                        if( contextText.indexOf('context') > -1 && contextText.indexOf('html') > -1 ){
                            isHTML = true;
                        }
                    }
                    return temp[0];
                } else {
                    return innerText;
                }
            });
            if( isHTML ){
                currentNode.parentNode.innerHTML = innerTextSplit;
            } else {
                currentNode.textContent = innerTextSplit;
            }
        }
    }
    
}

function settingInjection( currentNode, drawObj, variable, index, currentAttrNames, classObj ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        if( attrValue ){
            const injectionData = getPatternData( attrValue, variable );
            const templateName = injectionData[0];
            const templateData = parsingChildrenDom( classObj, templateName , variable );
            NodeUtils.AtoBMoveChilden(currentNode, templateData );
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function settingText( currentNode, drawObj, variable, index, currentAttrNames ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);

        if( attrValue ){
            const textData = getPatternData( attrValue, variable );
            if( textData.length > 1 ){
                const nextText = textData[1].toLowerCase();
                if( nextText.indexOf('context') > -1 && nextText.indexOf('html') > -1 ){
                    currentNode.innerHTML = textData[0];
                } else {
                    currentNode.textContent = textData[0];
                }
            }
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function settingReapeat( currentNode, drawObj, variable, index, currentAttrNames, classObj ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        currentNode.removeAttribute(attrDotName);
        
        if( attrValue ){
            const listData = getPatternData( attrValue, variable )[0];

            for( const listIndex in listData ){
                const item = listData[listIndex];
                const variClone = {...variable};
                const parentDom = document.createElement('div');
                const currentNodeClone = currentNode.cloneNode(true);

                parentDom.appendChild(currentNodeClone);

                const children = parentDom.childNodes;
                variClone[dotSplitName[1]] = item;
                variClone[dotSplitName[1]+'List'] = {
                    'index' : parseInt(listIndex),
                    'count' : parseInt(listIndex)+1
                };
                recursionChild( children[0], drawObj, variClone, classObj );
                currentNode.parentNode.insertBefore(children[0],currentNode);
            }

            currentNode.parentNode.removeChild(currentNode);
            while(currentNode.attributes.length > 0) {
                currentNode.removeAttribute(currentNode.attributes[0].name);
            }   
        }

        
    }
}

function settingList( currentNode, drawObj, variable, index, currentAttrNames, classObj ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        if( attrValue ){
            const listData = getPatternData( attrValue, variable )[0];
            const currentNodeClone = currentNode.cloneNode(true);
            
            NodeUtils.removeAllChilden(currentNode);

            for( const listIndex in listData ){
                const item = listData[listIndex];
                const variClone = {...variable};
                const childNode = currentNodeClone.childNodes;
                variClone[dotSplitName[1]] = item;
                variClone[dotSplitName[1]+'List'] = {
                    'index' : parseInt(listIndex),
                    'count' : parseInt(listIndex)+1
                };
                for( const child of childNode ){
                    const cloneChild = child.cloneNode(true);
                    const parentDom = document.createElement('div');
                    parentDom.appendChild(cloneChild);
                    recursionChild( parentDom, drawObj, variClone, classObj );
                    NodeUtils.AtoBMoveChilden(currentNode, parentDom);
                    
                }
            }
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function settingRest( checkingAttr, currentNode,variable ){
    for( const attr of checkingAttr ){
        const chanedValue = getPatternData( currentNode.getAttribute(attr), variable );
        currentNode.setAttribute( attr, chanedValue );
        }
}

function checkingCurrentAttr ( checkingAttr, compNameIndex, currentAttrNames, currentNode ){
    const sharedObj = JTemplate.sharedObj;

    for ( const index in currentAttrNames ){
        const attrName = currentAttrNames[index];
        const attrValue = currentNode.getAttribute(attrName);

        if( attrName.indexOf( sharedObj.COMPONENT_TEMPLATE ) > -1 ){
            compNameIndex[sharedObj.COMPONENT_TEMPLATE ] = parseInt(index);
        } else if( attrName.indexOf( sharedObj.COMPONENT_VAR ) > -1 ){
            compNameIndex[sharedObj.COMPONENT_VAR] == -1 ? compNameIndex[sharedObj.COMPONENT_VAR]=[ parseInt(index) ] : compNameIndex[sharedObj.COMPONENT_VAR].push(parseInt(index));
        } else if( attrName.indexOf( sharedObj.COMPONENT_TEST ) > -1) {
            compNameIndex[sharedObj.COMPONENT_TEST] = parseInt(index);
        } else if( attrName.indexOf( sharedObj.COMPONENT_ATTRIBUTE ) > -1 ){
            compNameIndex[sharedObj.COMPONENT_ATTRIBUTE] = parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_TEXT) > -1) {
            compNameIndex[sharedObj.COMPONENT_TEXT]= parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_LIST) > -1 ){
            compNameIndex[sharedObj.COMPONENT_LIST] = parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_REAPEAT) > -1 ){
            compNameIndex[sharedObj.COMPONENT_REAPEAT] = parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_INJECTION) > -1 ){
            compNameIndex[sharedObj.COMPONENT_INJECTION] = parseInt(index);
        } else if( attrValue.indexOf('}}') > -1 ){
            checkingAttr.push( attrName );
        }
    }
}

function settingTest( currentNode, drawObj, variable, index, currentAttrNames ){
    let result = true;
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        if( attrValue ){
            const patternData = getPatternData( attrValue, variable );
            result = patternData[0];
            if(dotSplitName.length > 1){
                variable[dotSplitName[1]] = result;
            }

            if( !result && currentNode.parentElement ){
                currentNode.parentElement.removeChild(currentNode);
            }
        }
        currentNode.removeAttribute(attrDotName);
    }
    return result;
}

function settingTemplate( currentNode, drawObj, variable, index, currentAttrNames ){
    if( index!== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);

        if( attrValue ){
            const patternData = getPatternData( attrValue, variable );
            if( patternData.length > 1 ){
                variable[patternData[1]] = drawObj;
            } else {
                throw new Error(`${sharedObj.COMPONENT_TEMPLATE} 뒤 @ 를 통해 대표 변수를 설정하세요`)
            }
        }
    currentNode.removeAttribute(attrDotName);
    
    }
}

function dotSplit( string ){
    return StringUtils.defaultIfBlank(string , '').split('.');
}

function getPatternData( inputString, matchObj = {} ){
    const result = [];
    if( inputString && inputString.search(/([*%\/+\-()]|==|<=|>=|>|<|&&|\|\|)/) > -1 ){
        inputString = inputString.replace(/([^*%\/+\-()=<>\|& {}]*)/g, function( matchString, innerText , offset, fullText ){
            if( innerText ){
                return getPatternData( `{{${innerText}}}`, matchObj );
            } else {
                return innerText;
            }
        })
    }

    if( inputString ){
        const arrPattern  = inputString.match(/{{([^{{}}]*)}}/);
        
        if( arrPattern && arrPattern.length > 0){
            const replaceText = arrPattern[1].trim();
            const atSplit = replaceText.split('@');
            const leftText = atSplit[0].trim();
            
            if( leftText.indexOf('\'') > -1 ){
                result.push( Calculator.cal (leftText.replace(/\'/g , '')) );
            } else {
                const dotSplitLeft = dotSplit( leftText );
                let matchText = '';
                if( dotSplitLeft.length > 1 ){
                    let getData = matchObj;
                    
                    for( const dotText of dotSplitLeft ){
                        if( getData ){
                            getData = getData[dotText];
                        }
                    }

                    if( getData === null || getData === undefined ){
                        throw new Error(`${leftText} 변수에 대한 내용이 없습니다`);
                    } else {
                        matchText = getData;
                    }
                } else {
                    matchText = matchObj[leftText];
                }

                if( matchText !== null && matchText !== undefined){
                    result.push( matchText )
                } else {
                    result.push( Calculator.cal (leftText) )
                }
            }

            if( atSplit.length > 1 ){
                const rightText = atSplit[1].trim();
                result.push( rightText )
            }
        } else {
            throw new Error(`${inputString}을 확인하세요 {{}} 형식이 아닙니다. `);
        }
    }

    return result;
}

function errCheck( componentName, checkObj, debugText ){
    if( !componentName ){
        throw new Error( `${debugText}이 존재하지 않습니다. ${debugText}을 작성하세요` );
    }

    if( checkObj[componentName] ){
        throw new Error( `${debugText}에  ${componentName}이 중복됩니다. 중복된 ${debugText}을 제거하세요` );
    }
}


export { StringUtils, ArrayUtils, NodeUtils, ObjectUtils, Stack, Calculator, JTemplate };

