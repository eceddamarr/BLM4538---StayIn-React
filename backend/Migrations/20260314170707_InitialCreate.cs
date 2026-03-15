using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VerificationCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VerificationCodeExpires = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Favorites = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Favorites", "FullName", "PasswordHash", "PhoneNumber", "Role", "VerificationCode", "VerificationCodeExpires" },
                values: new object[,]
                {
                    { 1, "ahmet@example.com", "[]", "Ahmet Yılmaz", "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3", "05321112233", "User", null, null },
                    { 2, "ayse@stayin.dev", "[]", "Ayşe Demir", "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3", "05334445566", "User", null, null },
                    { 3, "mehmet@stayin.dev", "[]", "Mehmet Kaya", "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3", "05347778899", "User", null, null },
                    { 4, "zeynep@stayin.dev", "[]", "Zeynep Şahin", "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3", "05352223344", "User", null, null },
                    { 5, "can@stayin.dev", "[]", "Can Öztürk", "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3", "05368889900", "User", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
