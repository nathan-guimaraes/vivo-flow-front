import { ExtractExpr, ItemExprUtils } from '../utils/item-expr.utils';
import { ObjectUtils } from '../utils/object.utils';

const equals = ObjectUtils.equals;

export interface TreeNodeLike<K = any, T = any> {
  readonly key: K;
  readonly data: T;
  readonly children?: ReadonlyArray<TreeNodeLike<K, T>>;
}

export class TreeNode<K = any, T = any> implements TreeNodeLike<K, T> {
  static invertTree<K, T>(
    treeList: ReadonlyArray<TreeNode<K, T>>,
    maxDepth: number = Number.MAX_SAFE_INTEGER
  ): TreeNode<K, T>[] {
    const results = new Array<TreeNode<K, T>>();

    const invertTree = (
      treeList: ReadonlyArray<TreeNode<K, T>>,
      currentDepth: number
    ) => {
      ++currentDepth;

      if (maxDepth < currentDepth) {
        return false;
      }

      for (const node of treeList) {
        if (!node.children.length || !invertTree(node.children, currentDepth)) {
          results.push(node);
        }
      }

      return true;
    };

    invertTree(treeList, 0);
    return results;
  }

  static treeFromList<K, T>(
    list: T[],
    keyExpr: ExtractExpr<T, K>,
    parentKeyExpr: ExtractExpr<T, K>
  ) {
    const treeNodeCache = new Map<K, TreeNode<K, T>>();
    const treeNodeListCache = new Map<K, Array<TreeNode<K, T>>>();

    const treeResults = new Array<TreeNode<K, T>>();

    let item: T;
    let node: TreeNode<K, T>;
    let parentKey: K;
    for (let i = 0; i < list.length; ++i) {
      item = list[i];
      node = new TreeNode<K, T>(
        ItemExprUtils.extractValue(item, i, keyExpr),
        item
      );

      treeNodeCache.set(node.key, node);

      parentKey = ItemExprUtils.extractValue(item, i, parentKeyExpr);

      if (parentKey == null) {
        treeResults.push(node);
      } else if (treeNodeCache.has(parentKey)) {
        const parent = treeNodeCache.get(parentKey);
        parent.addChildNode(node);
      } else {
        let parentQueue = treeNodeListCache.get(parentKey);
        if (parentQueue == null) {
          parentQueue = [];
          treeNodeListCache.set(parentKey, parentQueue);
        }

        parentQueue.push(node);
      }

      const queue = treeNodeListCache.get(node.key);
      if (queue != null) {
        let child: TreeNode<K, T>;
        while (queue.length > 0) {
          child = queue.shift();
          node.addChildNode(child);
        }
      }
    }

    return treeResults;
  }

  static parseTree<K, T>(tree: TreeNodeLike<K, T>[]): TreeNode<K, T>[] {
    return _parseTree(null, tree);
  }

  private _parent: WeakRef<TreeNode<K, T>>;

  get parent() {
    return this._parent?.deref() ?? null;
  }

  set parent(value) {
    let oldParent = this.parent;
    if (oldParent === value) {
      return;
    }

    if (oldParent !== null) {
      value.removeChildNode(this);
    }

    if (value === null) {
      this._parent = null;
    } else {
      value.addChildNode(this);
    }
  }

  get root() {
    let parent: TreeNode<K, T>;
    let node: TreeNode<K, T> = this;
    while ((parent = node.parent) != null) {
      node = parent;
    }

    return node;
  }

  private _children: TreeNode<K, T>[] = [];

  get children(): ReadonlyArray<TreeNode<K, T>> {
    return this._children;
  }

  get hasChildren() {
    return this._children.length > 0;
  }

  constructor(public readonly key: K, public data: T) {}

  containsChild(key: K, maxDepth = Number.MAX_SAFE_INTEGER) {
    return !!this.getChildNode(key, maxDepth);
  }

  getChildNode(key: K, maxDepth = Number.MAX_SAFE_INTEGER) {
    return _getChildNode(this, key, 1, maxDepth);
  }

  addChildByParent(parentKey: K, key: K, data: T): TreeNode<K, T> {
    var child = equals(key, parentKey) ? this : this.getChildNode(parentKey);
    if (child == null) {
      return null;
    }

    const node = new TreeNode<K, T>(key, data);
    node.parent = child;
    return node;
  }

  addChild(key: K, data: T) {
    const node = new TreeNode<K, T>(key, data);
    node.parent = this;
    return node;
  }

  removeChild(key: K) {
    var child = this.getChildNode(key);
    if (child != null) {
      child.parent = null;
      return child.data;
    }

    return null;
  }

  removeChildNode(child: TreeNode<K, T>): TreeNode<K, T> {
    if (child != null && child.parent == this) {
      let index = this._children.indexOf(child);
      if (index > -1) {
        this._children.splice(index, 1);
      }

      (child as any)._parent = null;
    }

    return this;
  }

  addChildNodeByParentKey(parentKey: K, child: TreeNode<K, T>): TreeNode<K, T> {
    if (child != null) {
      let node = this.getChildNode(parentKey);
      node?.addChildNode(child);
    }

    return this;
  }

  addChildNode(child: TreeNode<K, T>): TreeNode<K, T> {
    if (child != null) {
      this._children.push(child);
      (child as any)._parent = new WeakRef(this);
    }

    return this;
  }

  removeChildren(keys: K[]) {
    for (let key of keys) {
      this.removeChild(key);
    }
  }

  toList(maxDepth = Number.MAX_SAFE_INTEGER) {
    return _toList(this, 1, maxDepth);
  }

  toJSON() {
    return {
      key: this.key,
      data: this.data,
      children: this._children.map((x) => {
        return x.toJSON();
      }),
    };
  }
}

function _toList<K, T>(
  node: TreeNode<K, T>,
  currentDepth: number,
  maxDepth = Number.MAX_SAFE_INTEGER
) {
  if (currentDepth > maxDepth) {
    return null;
  }

  ++currentDepth;

  let results: TreeNode<K, T>[] = [node];

  let resultsAux: TreeNode<K, T>[];
  for (let child of node.children) {
    resultsAux = _toList(child, currentDepth, maxDepth);
    if (!resultsAux?.length) {
      continue;
    }

    results = results.concat(resultsAux);
  }

  return results;
}

function _getChildNode<K, T>(
  currentNode: TreeNode<K, T>,
  key: K,
  currentDepth: number,
  maxDepth = Number.MAX_SAFE_INTEGER
) {
  let auxNode: TreeNode<K, T>;
  for (let node of currentNode.children) {
    if (equals(node.key, key)) {
      return node;
    }

    if (currentDepth >= maxDepth) {
      continue;
    }

    auxNode = _getChildNode(node, key, currentDepth + 1, maxDepth);
    if (auxNode != null) {
      return auxNode;
    }
  }

  return null;
}

function _parseTree<K, T>(
  parent: TreeNode<K, T>,
  tree: ReadonlyArray<TreeNodeLike<K, T>>
): TreeNode<K, T>[] {
  const results = tree.map((item) => {
    const node = new TreeNode<K, T>(item.key, item.data);
    if (parent !== null) {
      node.parent = parent;
    }

    if (item.children?.length) {
      _parseTree(node, item.children);
    }

    return node;
  });

  return results;
}
