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

export { StringUtils, ArrayUtils, NodeUtils, ObjectUtils};



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

export { Stack, Calculator };



function aGet() {
    console.log('hahahahahahahahahazzssaasdsas');
}

