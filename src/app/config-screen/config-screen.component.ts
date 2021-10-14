import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-config-screen',
  templateUrl: './config-screen.component.html',
  styleUrls: ['./config-screen.component.css']
})
export class ConfigScreenComponent implements OnInit {
  public imageInput: any = undefined;
  public imageInputView: any;
  public themes: any;

  constructor() { }

  ngOnInit(): void {
    this.themes = [
      {name: "Escruro", value: "dark"},
      {name: "Claro", value: "light"}
    ]
  }

  goTo(location: string): void {
    window.location.hash = '';
    window.location.hash = location;
  }

  onChange(fileInput): void {
    this.imageInput = fileInput.target.files[0];
    const reader = new FileReader();

    // Transforma em file
    reader.onload = (e: any) => {
      this.imageInput = e.target.result;
    };

    // Exibe imagem na tela dando um preview para o usuario
    this.imageInputView = fileInput.target.files[0];
    const readerImage = new FileReader();

    readerImage.readAsDataURL(fileInput.target.files[0]);

    readerImage.onload = (e: any) => {
      this.imageInputView = e.target.result;
    };
  }

}
