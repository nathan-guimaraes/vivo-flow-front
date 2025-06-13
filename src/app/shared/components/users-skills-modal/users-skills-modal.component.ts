import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectBoxModule } from '../select-box/select-box.module';
import { IconicModule } from '../iconic/iconic.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbModalModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { UsersService } from '../../services/users.service';
import { FieldModule } from '../field/field.module';
import { OptionModelLike } from '../../models/option.model';
import { UserStatus } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { DateBoxComponent } from '../date-box/date-box.component';
import { HoverClassDirective } from '../../directives/hover-class/hover-class.directive';
import { SkillsBoxComponent } from './components/skills-box/skills-box.component';
import { ExtractExpr, ItemExprUtils } from '../../utils/item-expr.utils';
import { Observable, finalize, startWith } from 'rxjs';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { TowersService } from '../../services/towers.service';
import { IslandModelLike } from '../../models/island.model';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { IslandsService } from '../../services/islands.service';
import { SubislandsService } from '../../services/subislands.service';
import { SubislandModelLike } from '../../models/subisland.model';
import { SubjectsService } from '../../services/subjects.service';
import { SubjectModelLike } from '../../models/subject.model';
import { NegotiationTypesService } from '../../services/negotiation-types.service';
import { NegotiationTypeModelLike } from '../../models/negotiation-type.model';
import { ProductsService } from '../../services/products.service';
import { ProductModelLike } from '../../models/product.model';
import { SegmentsService } from '../../services/segments.service';
import { SuppliersService } from '../../services/suppliers.service';
import { CustomersService } from '../../services/customers.service';
import { TreeNode } from '../../helpers/tree';
import { TimeIntervalBoxComponent } from '../time-interval-box/time-interval-box.component';
import { DropdownButtonModule } from '../dropdown-button/dropdown-button.module';
import { WorkscalesService } from '../../services/workscale.service';
import { WorkloadsService } from '../../services/workloads.service';
import { ObjectUtils } from '../../utils/object.utils';
import {
  UserFilterLike,
  UserFilterOptionsDTOLike,
} from '../../models/dtos/user-filter.dto';
import { UserDetailsModel } from '../../models/user-details.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimeIntervalLike } from '../../helpers/time-span/time-interval';
import { UserSkillsDTOLike } from '../../models/dtos/user-skills.dto';
import { orderBy } from 'lodash';
import FileSaver from 'file-saver';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

interface UsersSkillsFormLike {
  statusId: FormControl<UserStatus>;
  returnedAt: FormControl<Date>;
  workscaleId: FormControl<number>;
  workloadId: FormControl<number>;
  worktime: FormControl<TimeIntervalLike>;
  priority: FormControl<boolean>;
  supplierId: FormControl<number>;
  supervisorId: FormControl<number>;
}

type DataSourceValueLike<T> =
  | T[]
  | Observable<T[]>
  | Promise<T[]>
  | CustomDataSource<T>;

enum MultipleOptionsBoxCfgKey {
  Tower,
  Island,
  Subisland,
  Subject,
  NegotiationType,
  Product,
  Segment,
  Customer,
}

interface MultipleOptionsBoxCfgLike<T = any> {
  title: string;
  disabled?: boolean;
  principalMode?: boolean;
  principalKey?: any;
  items?: T[];
  parentExpr?: ExtractExpr<T>;
  keyExpr?: ExtractExpr<T>;
  displayExpr?: ExtractExpr<T>;
  dataSource?: DataSourceValueLike<T>;
}

const defaultKeyExpr: ExtractExpr<any> = (x) => x?.id;
const defaultDisplayExpr: ExtractExpr<any> = (x) => x?.name;

const towerAsParentExpr: ExtractExpr<
  IslandModelLike | NegotiationTypeModelLike | ProductModelLike
> = (x) => x?.towerId;
const islandAsParentExpr: ExtractExpr<SubislandModelLike> = (x) => x?.islandId;
const subislandAsParentExpr: ExtractExpr<SubjectModelLike> = (x) =>
  x?.subislandId;

@Component({
  selector: 'app-users-skills-modal',
  templateUrl: 'users-skills-modal.component.html',
  styleUrls: ['users-skills-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModalModule,
    NgbTooltipModule,
    ModalTemplateComponent,
    DropdownButtonModule,
    FieldModule,
    SelectBoxModule,
    DateBoxComponent,
    TimeIntervalBoxComponent,
    IconicModule,
    HoverClassDirective,
    SkillsBoxComponent,
  ],
})
export class UsersSkillsModalComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @Input()
  userDetailsMode = false;
  @Input()
  userId: number;
  @Input()
  filters: UserFilterLike;

  user: UserDetailsModel;

  formGroup: FormGroup<UsersSkillsFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  statusDataSource = this.usersService.listStatusForAction();

  workscaleDataSource = this.workscalesService.list();
  workloadDataSource = this.workloadsService.list();

  priorityDataSource: OptionModelLike<boolean>[] = [
    {
      label: this.translateService.instant('defaults.not'),
      value: false,
    },
    {
      label: this.translateService.instant('defaults.yes'),
      value: true,
    },
  ];

  supplierDataSource = this.suppliersService.list();
  supervisorDataSource = this.usersService.listSupervisors();

  private multipleOptionsBoxCfgTreeList: TreeNode<
    MultipleOptionsBoxCfgKey,
    MultipleOptionsBoxCfgLike
  >[];
  multipleOptionsBoxCfgFlatList: TreeNode<
    MultipleOptionsBoxCfgKey,
    MultipleOptionsBoxCfgLike
  >[];

  private _groupDisplayExprMap = new WeakMap<
    TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>,
    ExtractExpr<any>
  >();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private subjectsService: SubjectsService,
    private negotiationTypesService: NegotiationTypesService,
    private productsService: ProductsService,
    private segmentsService: SegmentsService,
    private customersService: CustomersService,
    private suppliersService: SuppliersService,
    private workscalesService: WorkscalesService,
    private workloadsService: WorkloadsService,
    private translateService: TranslateService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<UsersSkillsFormLike>({
      statusId: this.formBuilder.control<UserStatus>(null, [
        Validators.required,
      ]),
      returnedAt: this.formBuilder.control<Date>(null, [Validators.required]),
      workscaleId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      workloadId: this.formBuilder.control<number>(null, [Validators.required]),
      worktime: this.formBuilder.control<TimeIntervalLike>(null, [
        Validators.required,
      ]),
      priority: this.formBuilder.control<boolean>(null, [Validators.required]),
      supplierId: this.formBuilder.control<number>(null, [Validators.required]),
      supervisorId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.multipleOptionsBoxCfgTreeList = TreeNode.parseTree<
      MultipleOptionsBoxCfgKey,
      MultipleOptionsBoxCfgLike
    >([
      {
        key: MultipleOptionsBoxCfgKey.Tower,
        data: {
          title: 'users-skills-modal.skill-boxes.tower',
          principalMode: true,
          dataSource: this.towersService.list(),
        },
        children: [
          {
            key: MultipleOptionsBoxCfgKey.Island,
            data: {
              title: 'users-skills-modal.skill-boxes.island',
              disabled: true,
              parentExpr: towerAsParentExpr,
              principalMode: true,
              dataSource: new CustomRawDataSource({
                load: () => {
                  return this.islandsService.listByTowers(
                    this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Tower)
                  );
                },
              }),
            },
            children: [
              {
                key: MultipleOptionsBoxCfgKey.Subisland,
                data: {
                  title: 'users-skills-modal.skill-boxes.subIsland',
                  disabled: true,
                  parentExpr: islandAsParentExpr,
                  principalMode: true,
                  dataSource: new CustomRawDataSource({
                    load: () => {
                      return this.subislandsService.listByIslands(
                        this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Island)
                      );
                    },
                  }),
                },
                children: [
                  {
                    key: MultipleOptionsBoxCfgKey.Subject,
                    data: {
                      title: 'users-skills-modal.skill-boxes.subject',
                      disabled: true,
                      parentExpr: subislandAsParentExpr,
                      principalMode: true,
                      dataSource: new CustomRawDataSource({
                        load: () => {
                          return this.subjectsService.listBySubislands(
                            this.getAddedItemKeys(
                              MultipleOptionsBoxCfgKey.Subisland
                            )
                          );
                        },
                      }),
                    },
                  },
                ],
              },
            ],
          },
          {
            key: MultipleOptionsBoxCfgKey.NegotiationType,
            data: {
              title: 'users-skills-modal.skill-boxes.type-negotioation',
              disabled: true,
              parentExpr: towerAsParentExpr,
              principalMode: true,
              dataSource: new CustomRawDataSource({
                load: () => {
                  return this.negotiationTypesService.listByTowers(
                    this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Tower)
                  );
                },
              }),
            },
          },
          {
            key: MultipleOptionsBoxCfgKey.Product,
            data: {
              title: 'users-skills-modal.skill-boxes.product',
              disabled: true,
              parentExpr: towerAsParentExpr,
              dataSource: new CustomRawDataSource({
                load: () => {
                  return this.productsService.listByTowers(
                    this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Tower)
                  );
                },
              }),
            },
          },
        ],
      },
      {
        key: MultipleOptionsBoxCfgKey.Segment,
        data: {
          title: 'users-skills-modal.skill-boxes.segment',
          dataSource: this.segmentsService.list(),
        },
      },
      {
        key: MultipleOptionsBoxCfgKey.Customer,
        data: {
          title: 'users-skills-modal.skill-boxes.customer',
          dataSource: new CustomDataSource({
            load: (options) => {
              return this.customersService.listPagedCustomer({
                ...options,
                requireTotalCount: true,
              });
            },
            pageSize: 10,
          }),
        },
      },
    ]);

    this.multipleOptionsBoxCfgFlatList =
      this.multipleOptionsBoxCfgTreeList.flatMap((x) => x.toList());

    this.multipleOptionsBoxCfgFlatList.forEach((item) => {
      item.data.keyExpr ??= defaultKeyExpr;
      item.data.displayExpr ??= defaultDisplayExpr;
    });

    this.f.statusId.valueChanges
      .pipe(
        startWith(this.f.statusId.getRawValue()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        if (status === UserStatus.Inactive) {
          this.f.returnedAt.enable();
        } else {
          this.f.returnedAt.disable();
          this.f.returnedAt.reset();
        }
      });

    if (this.userDetailsMode) {
      this.globalLoadingController.show();
      this.usersService
        .getDetailsById(this.userId)
        .pipe(
          finalize(() => {
            this.globalLoadingController.hide();
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (user) => {
            this.user = user;

            this.syncSkillsWithUser();
          },
          error: (response) => {
            if (!response) {
              return;
            }

            this.toastService.error('users-skills-modal.errors.cannotLoadUser');
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.multipleOptionsBoxCfgFlatList?.forEach((item) => {
      const dataSource = item.data.dataSource;
      if (dataSource instanceof CustomDataSource) {
        dataSource.dispose();
      }
    });

    this.multipleOptionsBoxCfgFlatList = null;
    this.multipleOptionsBoxCfgTreeList = null;
  }

  onBtnDownloadSkillsTemplateClick() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.usersService
      .downloadImportSkillsTemplate()
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob) => {
          this.toastService.success(
            `users-skills-modal.messages.skills-template-downloaded`
          );

          FileSaver.saveAs(blob, blob.name || `usuarios-skills-modelo.xlsx`);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `users-skills-modal.errors.cannotDownloadSkillsTemplate`
          );
        },
      });
  }

  onImportSkillsFileChanged(inputEl: HTMLInputElement) {
    const file = inputEl.files?.item?.(0);
    if (!file || this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.usersService
      .importSkills(file, this.filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();

          inputEl.value = '';
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `users-skills-modal.messages.skills-updated`
          );

          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `users-skills-modal.errors.cannotChangeSkills`
          );
        },
      });
  }

  onSubmit() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.submitted = true;
    if (this.formGroup.invalid) {
      return;
    }

    // #region Prepare and validate Skills
    const validateListFn = (list: any[], message: string): boolean => {
      if (list.length) {
        return true;
      }

      this.toastService.warning(message);
      return false;
    };

    const towerIds = this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Tower);
    if (
      !validateListFn(towerIds, 'users-skills-modal.warnings.towerRequired')
    ) {
      return;
    }

    const islandIds = this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Island);
    if (
      !validateListFn(islandIds, 'users-skills-modal.warnings.islandRequired')
    ) {
      return;
    }

    const subislandIds = this.getAddedItemKeys(
      MultipleOptionsBoxCfgKey.Subisland
    );
    if (
      !validateListFn(
        subislandIds,
        'users-skills-modal.warnings.subislandRequired'
      )
    ) {
      return;
    }

    const subjectIds = this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Subject);
    const negotiationTypeIds = this.getAddedItemKeys(
      MultipleOptionsBoxCfgKey.NegotiationType
    );
    if (
      !validateListFn(
        negotiationTypeIds,
        'users-skills-modal.warnings.negotiationTypeRequired'
      )
    ) {
      return;
    }

    const productIds = this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Product);
    if (
      !validateListFn(productIds, 'users-skills-modal.warnings.productRequired')
    ) {
      return;
    }

    const segmentIds = this.getAddedItemKeys(MultipleOptionsBoxCfgKey.Segment);
    if (
      !validateListFn(segmentIds, 'users-skills-modal.warnings.segmentRequired')
    ) {
      return;
    }

    const customerIds = this.getAddedItemKeys(
      MultipleOptionsBoxCfgKey.Customer
    );

    const towerId = this.getSkillPrincipalValue(MultipleOptionsBoxCfgKey.Tower);
    if (!towerId) {
      this.toastService.warning(
        'users-skills-modal.warnings.towerPrincipalRequired'
      );
      return;
    }

    const islandId = this.getSkillPrincipalValue(
      MultipleOptionsBoxCfgKey.Island
    );
    const subislandId = this.getSkillPrincipalValue(
      MultipleOptionsBoxCfgKey.Subisland
    );
    const subjectId = this.getSkillPrincipalValue(
      MultipleOptionsBoxCfgKey.Subject
    );

    const negotiationTypeId = this.getSkillPrincipalValue(
      MultipleOptionsBoxCfgKey.NegotiationType
    );

    const values = this.formGroup.getRawValue();

    const skills: UserSkillsDTOLike = {
      ...values,
      towerId,
      islandId,
      subislandId,
      subjectId,
      negotiationTypeId,
      towerIds,
      islandIds,
      subislandIds,
      subjectIds,
      negotiationTypeIds,
      productIds,
      segmentIds,
      customerIds,
    };
    // #endregion

    this.globalLoadingController.show();
    this.usersService
      .updateSkills(skills, this.filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `users-skills-modal.messages.skills-updated`
          );

          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `users-skills-modal.errors.cannotChangeSkills`
          );
        },
      });
  }

  onSkillPrincipalKeyChanged(
    node: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>
  ) {
    this.syncSkillPrincipalByParent(node);
  }

  onSkillItemsChanged(
    node: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>
  ) {
    this.syncSkillItemsByParent(node);
  }

  _getParentDisplayExprFn(
    node: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>
  ): ExtractExpr<any> {
    if (!node) {
      return null;
    }

    let expr = this._groupDisplayExprMap.get(node);
    if (!expr) {
      const parentNode = node.parent;
      expr = (item: any, index: number) => {
        let textArr: string[] = [];

        const grandParentNode = parentNode?.parent;
        if (grandParentNode) {
          const grandParentNodeDisplayExpr =
            this._getParentDisplayExprFn(grandParentNode);
          if (grandParentNodeDisplayExpr) {
            const grandParentKey = ItemExprUtils.extractValue(
              item,
              index,
              parentNode.data.parentExpr
            );
            const grandParentItem = grandParentNode?.data?.items?.find(
              (x, i) => {
                const key = ItemExprUtils.extractValue(
                  x,
                  i,
                  grandParentNode.data.keyExpr
                );
                return ObjectUtils.equals(key, grandParentKey);
              }
            );
            const grandParentText = ItemExprUtils.extractValue(
              grandParentItem,
              null,
              grandParentNodeDisplayExpr
            );
            textArr.push(grandParentText);
          }

          const text = ItemExprUtils.extractValue(
            item,
            null,
            parentNode.data.displayExpr
          );
          textArr.push(text);
        } else {
          const text = ItemExprUtils.extractValue(
            item,
            null,
            node.data.displayExpr
          );
          textArr.push(text);
        }

        return textArr.join(' / ');
      };
      this._groupDisplayExprMap.set(node, expr);
    }

    return expr;
  }

  private syncSkillsWithUser(user = this.user) {
    this.formGroup.reset(user);

    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Tower, user.towers);
    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Island, user.islands);
    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Subisland, user.subislands);
    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Subject, user.subjects);
    this.setAddedItemKeys(
      MultipleOptionsBoxCfgKey.NegotiationType,
      user.negotiationTypes
    );
    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Product, user.products);
    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Segment, user.segments);
    this.setAddedItemKeys(MultipleOptionsBoxCfgKey.Customer, user.customers);

    this.setPrincipalItemKey(MultipleOptionsBoxCfgKey.Tower, user.towerId);
    this.setPrincipalItemKey(MultipleOptionsBoxCfgKey.Island, user.islandId);
    this.setPrincipalItemKey(
      MultipleOptionsBoxCfgKey.Subisland,
      user.subislandId
    );
    this.setPrincipalItemKey(MultipleOptionsBoxCfgKey.Subject, user.subjectId);

    for (const node of this.multipleOptionsBoxCfgFlatList) {
      this.syncSkillItemsByParent(node);
    }
  }

  private enableSkillItemsBox(
    ...nodes: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>[]
  ) {
    for (let node of nodes) {
      const cfg = node?.data;
      if (cfg && cfg.disabled) {
        cfg.disabled = false;
      }
    }
  }

  private disableSkillItemsBox(
    ...nodes: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>[]
  ) {
    for (let node of nodes) {
      const cfg = node?.data;
      if (cfg && !cfg.disabled) {
        cfg.disabled = true;
        if (cfg.items?.length) {
          cfg.items = null;
          this.syncSkillItemsByParent(node);
        }
      }
    }
  }

  private reloadSkillItemsBox(
    ...nodes: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>[]
  ) {
    for (let node of nodes) {
      const dataSource = node.data.dataSource;
      if (dataSource instanceof CustomDataSource) {
        if (dataSource instanceof CustomRawDataSource) {
          dataSource.clearRawData();
        }

        dataSource.reload();
      }
    }
  }

  private syncSkillPrincipalByParent(
    node: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>,
    topToBottom: boolean = null
  ) {
    const cfg = node?.data;
    if (!cfg?.principalMode) {
      return;
    }

    const syncChildWithParentFn = (
      child: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>
    ) => {
      const childCfg = child.data;
      if (!childCfg.principalMode) {
        return;
      }

      const parent = child.parent;
      const parentCfg = parent?.data;
      if (!parentCfg?.principalMode) {
        return;
      }

      let shouldRemoveChildPrincipalKey = true;
      if (parentCfg.principalKey && childCfg.principalKey) {
        const item = childCfg.items?.find((item) => {
          const key = ItemExprUtils.extractValue(item, null, childCfg.keyExpr);
          return key === childCfg.principalKey;
        });
        if (item) {
          const parentKey = ItemExprUtils.extractValue(
            item,
            null,
            childCfg.parentExpr
          );
          if (parentKey === parentCfg.principalKey) {
            shouldRemoveChildPrincipalKey = false;
          }
        }
      }

      if (shouldRemoveChildPrincipalKey) {
        childCfg.principalKey = null;
      }

      this.syncSkillPrincipalByParent(child, true);
    };

    if (cfg.principalKey && !topToBottom) {
      const parentNode = node.parent;
      if (parentNode) {
        const item = cfg.items?.find((item) => {
          const key = ItemExprUtils.extractValue(item, null, cfg.keyExpr);
          return key === cfg.principalKey;
        });
        if (item) {
          const parentKey = ItemExprUtils.extractValue(
            item,
            null,
            cfg.parentExpr
          );
          const parentCfg = parentNode.data;
          if (parentKey !== parentCfg.principalKey) {
            parentCfg.principalKey = parentKey;

            this.syncSkillPrincipalByParent(parentNode, false);

            for (const child of parentNode.children) {
              if (child === node) {
                continue;
              }

              syncChildWithParentFn(child);
            }
          }
        }
      }
    }

    if (
      (typeof topToBottom !== 'boolean' || topToBottom === true) &&
      node.hasChildren
    ) {
      for (const child of node.children) {
        syncChildWithParentFn(child);
      }
    }
  }

  private syncSkillItemsByParent(
    parentNode: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>
  ) {
    const parentCfg = parentNode.data;
    if (parentCfg.items?.length) {
      parentCfg.items = orderBy(parentCfg.items, (x) => {
        return this._getSkillItemPathDisplayText(parentNode, x);
      });

      this.enableSkillItemsBox(...parentNode.children);

      const parentItemKeys = parentCfg.items?.map((x) => {
        return ItemExprUtils.extractValue(x, null, parentCfg.keyExpr);
      });

      for (let node of parentNode.children) {
        const cfg = node.data;
        const parentExpr = cfg.parentExpr;
        let items = cfg.items;
        if (items?.length) {
          items = items.filter((x) => {
            const parentKeyAux = ItemExprUtils.extractValue(
              x,
              null,
              parentExpr
            );
            return parentItemKeys.includes(parentKeyAux);
          });
        }

        if (cfg.items?.length !== items?.length) {
          cfg.items = items;
          this.onSkillItemsChanged(node);

          this.syncSkillPrincipalByParent(node);
        }
      }
    } else {
      this.disableSkillItemsBox(...parentNode.children);
    }

    this.reloadSkillItemsBox(...parentNode.children);
  }

  private setPrincipalItemKey(key: MultipleOptionsBoxCfgKey, value: any) {
    const node = this.getSkillCfgNode(key);
    node.data.principalKey = value;
  }

  private setAddedItemKeys(key: MultipleOptionsBoxCfgKey, items: any[]) {
    const node = this.getSkillCfgNode(key);
    node.data.items = items;
  }

  private getAddedItemKeys(key: MultipleOptionsBoxCfgKey) {
    const node = this.getSkillCfgNode(key);
    return (
      node.data.items?.map((item) => {
        return ItemExprUtils.extractValue(item, null, node.data.keyExpr);
      }) ?? []
    );
  }

  private getSkillPrincipalValue(key: MultipleOptionsBoxCfgKey) {
    const cfg = this.getSkillCfgNode(key);
    return cfg.data.principalKey;
  }

  private getSkillCfgNode(key: MultipleOptionsBoxCfgKey) {
    for (let node of this.multipleOptionsBoxCfgTreeList) {
      if (node.key === key) {
        return node;
      }

      const childNode = node.getChildNode(key);
      if (childNode) {
        return childNode;
      }
    }

    return null;
  }

  private _getSkillItemPathDisplayText(
    node: TreeNode<MultipleOptionsBoxCfgKey, MultipleOptionsBoxCfgLike>,
    item: any
  ) {
    const dataCfg = node.data;
    let text = ItemExprUtils.extractValue(item, null, dataCfg.displayExpr);

    if (dataCfg.parentExpr) {
      const parentDisplayExpr = this._getParentDisplayExprFn(node);
      if (parentDisplayExpr) {
        const parentKey = ItemExprUtils.extractValue(
          item,
          null,
          dataCfg.parentExpr
        );
        const parentCfg = node.parent.data;
        const parentItem = parentCfg.items.find((x) => {
          const key = ItemExprUtils.extractValue(x, null, parentCfg.keyExpr);
          return key === parentKey;
        });

        const parentText = ItemExprUtils.extractValue(
          parentItem,
          null,
          parentDisplayExpr
        );
        text = parentText + ' / ' + text;
      }
    }

    return text;
  }
}
