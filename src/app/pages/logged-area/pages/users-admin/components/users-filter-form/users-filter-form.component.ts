import {
  Component,
  DestroyRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { map, shareReplay } from 'rxjs';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { SelectBoxModule } from 'src/app/shared/components/select-box/select-box.module';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';
import {
  UserFilterLike,
  UserFilterOptionsDTOLike,
} from 'src/app/shared/models/dtos/user-filter.dto';
import { IslandsService } from 'src/app/shared/services/islands.service';
import { SegmentsService } from 'src/app/shared/services/segments.service';
import { SubislandsService } from 'src/app/shared/services/subislands.service';
import { SubjectsService } from 'src/app/shared/services/subjects.service';
import { SuppliersService } from 'src/app/shared/services/suppliers.service';
import { TowersService } from 'src/app/shared/services/towers.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ExtractExpr } from 'src/app/shared/utils/item-expr.utils';

interface FilterFormLike {
  logins: FormControl<UserFilterOptionsDTOLike['logins']>;
  names: FormControl<UserFilterOptionsDTOLike['names']>;
  supervisors: FormControl<UserFilterOptionsDTOLike['supervisors']>;
  profiles: FormControl<UserFilterOptionsDTOLike['profiles']>;
  towers: FormControl<UserFilterOptionsDTOLike['towers']>;
  islands: FormControl<UserFilterOptionsDTOLike['islands']>;
  subislands: FormControl<UserFilterOptionsDTOLike['subislands']>;
  subjects: FormControl<UserFilterOptionsDTOLike['subjects']>;
  segments: FormControl<UserFilterOptionsDTOLike['segments']>;
  suppliers: FormControl<UserFilterOptionsDTOLike['suppliers']>;
  statuses: FormControl<UserFilterOptionsDTOLike['statuses']>;
}

@Component({
  selector: 'app-users-filter-form',
  templateUrl: 'users-filter-form.component.html',
  styleUrls: ['users-filter-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    NgbTooltipModule,
    SelectBoxModule,
    IconicModule,
    HoverClassDirective,
  ],
})
export class UsersFilterFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onFiltersChanged = new EventEmitter<UserFilterLike>();

  formGroup: FormGroup<FilterFormLike>;

  usersDataSource = this.usersService.listSimpleUsers();
  supervisorsDataSource = this.usersService.listSupervisors();
  profileDataSource = this.usersService.listProfile();
  towerDataSource = this.towersService.list();
  islandDataSource = this.islandsService.list();
  subislandDataSource = this.subislandsService.list();
  subjectDataSource = this.subjectsService.list();
  segmentDataSource = this.segmentsService.list();
  supplierDataSource = this.suppliersService.list();
  statusDataSource = this.usersService.listStatus();

  selectedTextExpr = (x) => null;

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private subjectsService: SubjectsService,
    private segmentsService: SegmentsService,
    private suppliersService: SuppliersService
  ) {
    this.formGroup = this.formBuilder.group<FilterFormLike>({
      logins:
        this.formBuilder.control<UserFilterOptionsDTOLike['logins']>(null),
      names: this.formBuilder.control<UserFilterOptionsDTOLike['names']>(null),
      supervisors:
        this.formBuilder.control<UserFilterOptionsDTOLike['supervisors']>(null),
      profiles:
        this.formBuilder.control<UserFilterOptionsDTOLike['profiles']>(null),
      towers:
        this.formBuilder.control<UserFilterOptionsDTOLike['towers']>(null),
      islands:
        this.formBuilder.control<UserFilterOptionsDTOLike['islands']>(null),
      subislands:
        this.formBuilder.control<UserFilterOptionsDTOLike['subislands']>(null),
      subjects:
        this.formBuilder.control<UserFilterOptionsDTOLike['subjects']>(null),
      segments:
        this.formBuilder.control<UserFilterOptionsDTOLike['segments']>(null),
      suppliers:
        this.formBuilder.control<UserFilterOptionsDTOLike['suppliers']>(null),
      statuses:
        this.formBuilder.control<UserFilterOptionsDTOLike['statuses']>(null),
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const values = this.formGroup.getRawValue();
        this.onFiltersChanged.emit(values);
      });
  }

  onBtnClearClick() {
    this.formGroup.reset();
  }
}
