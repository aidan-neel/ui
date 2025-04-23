package routes

import (
	"net/http"
	"themes/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterThemeRoutes(e *echo.Echo, db *gorm.DB) {
	// @Summary Publish a theme
	// @Description Uploads a new CSS theme
	// @Tags themes
	// @Accept json
	// @Produce json
	// @Param theme body models.Theme true "Theme object"
	// @Success 200 {string} string "ok"
	// @Router /themes/publish [post]
	e.POST("/themes/publish", func(c echo.Context) error {
		var body struct {
			Name string `json:"name"`
			CSS  string `json:"css"`
		}
		if err := c.Bind(&body); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid body"})
		}
		theme := models.Theme{Name: body.Name, CSS: body.CSS}
		if err := db.Create(&theme).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "db error"})
		}
		return c.JSON(http.StatusOK, echo.Map{"message": "theme saved"})
	})

	// @Summary Get theme by name
	// @Description Retrieves a theme by its name
	// @Tags themes
	// @Produce json
	// @Param name path string true "Theme name"
	// @Success 200 {object} models.Theme
	// @Failure 404 {object} map[string]string
	// @Router /themes/name/{name} [get]
	e.GET("/themes/name/:name", func(c echo.Context) error {
		name := c.Param("name")
		var theme models.Theme
		if err := db.Where("name = ?", name).First(&theme).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "theme not found"})
		}
		return c.JSON(http.StatusOK, theme)
	})
}
