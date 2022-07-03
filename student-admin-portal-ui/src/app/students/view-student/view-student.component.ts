import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Gender } from 'src/app/models/api-models/gender.model';
import { Student } from 'src/app/models/api-models/student.model';
import { GenderService } from 'src/app/services/gender.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit {
  id: string | null | undefined;
  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    genderId: '',
    profileImageUrl: '',
    gender: {
      id: '',
      description: ''
    },
    address: {
      id: '',
      physicalAddress: '',
      postalAddress: ''
    }
  }

  isNewStudent:boolean = false;
  header:string = '';
  displayProfileImageUrl = '';

  genderList : Gender[] = [];

  @ViewChild('studentDetailsForm') studentDetailsForm?: NgForm;

  constructor(
    private readonly studentService:StudentService,
    private readonly route:ActivatedRoute,
    private readonly genderService:GenderService,
    private snackbar: MatSnackBar,
    private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        this.id = params.get('id');

        if(this.id){
          //if the route contains the 'add'
          if(this.id.toLocaleLowerCase() === 'Add'.toLocaleLowerCase()){
            // => new student functionality
            this.isNewStudent = true;
            this.header = 'Add New student';
            this.setImage();
          }
          else{
            //=> existing student functionality
            this.isNewStudent = false;
            this.header = 'Edit student';
            this.studentService.getStudent(this.id)
            .subscribe(
              (successResponse) => {
                this.student = successResponse;
                this.setImage();
              },
              (error) => {
                console.log(error);
                // this.setImage();
              }
          );
          }

          this.genderService.getGenderList()
          .subscribe(
            (successResponse) => {
              this.genderList = successResponse;
            }
          );
        }
      }
    );
  }

  onUpdate():void{
    if(this.studentDetailsForm?.form.valid){
      this.studentService.updateStudent(this.student.id, this.student)
      .subscribe(
        (successResponse) =>{
          //show a notification
          this.snackbar.open(`Student updated successfully`, undefined, {
            duration: 2000
          });
        },
        (error) => {
          //log it
          console.log(error);
        }
      );
    }

  }

  onDelete():void{
    this.studentService.deleteStudent(this.student.id)
    .subscribe(
      (successResponse) =>{
        setTimeout(() => {
          this.router.navigateByUrl('students');
          this.snackbar.open('Student deleted successfully', undefined, {
            duration: 2000
          });
        });

      },
      (error) =>{
        console.log(error);
      }
    )
  }

  onAdd():void{
    if(this.studentDetailsForm?.form.valid){
      //Submit form data to api
      this.studentService.addStudent(this.student)
      .subscribe(
        (successResponse) => {
          setTimeout(() => {
            this.router.navigateByUrl('students');
            this.snackbar.open('Student Created successfully', undefined, {
              duration: 2000
            });
          });
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  uploadImage(event:any):void{
    if(this.id){
      const file:File = event.target.files[0];
      this.studentService.uploadImage(this.student.id, file)
      .subscribe(
        (successResponse) => {
          this.student.profileImageUrl = successResponse;
          this.setImage();
          //show notification
          this.snackbar.open('Student Created successfully', undefined, {
            duration: 2000
          });
        },
        (error) => {
          console.log(error);
          this.setImage();
        }
      )
    }
  }

  private setImage(): void{
    if(this.student.profileImageUrl){
      //Fecth the image url
      this.displayProfileImageUrl = this.studentService.getImagePath(this.student.profileImageUrl);
    }
    else{
      //Display a default
      this.displayProfileImageUrl = '/assets/user.png';
    }
  }
}
